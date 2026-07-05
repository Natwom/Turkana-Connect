from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from typing import Dict, Set
from datetime import datetime

from app.database import get_db
from app import models

router = APIRouter(prefix="/ws/live", tags=["WebSocket Live"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, Set[WebSocket]] = {}
        self.viewer_counts: Dict[int, int] = {}
    
    async def connect(self, websocket: WebSocket, stream_id: int):
        await websocket.accept()
        if stream_id not in self.active_connections:
            self.active_connections[stream_id] = set()
            self.viewer_counts[stream_id] = 0
        self.active_connections[stream_id].add(websocket)
        self.viewer_counts[stream_id] += 1
    
    def disconnect(self, websocket: WebSocket, stream_id: int):
        if stream_id in self.active_connections:
            self.active_connections[stream_id].discard(websocket)
            self.viewer_counts[stream_id] = max(0, self.viewer_counts[stream_id] - 1)
            if len(self.active_connections[stream_id]) == 0:
                del self.active_connections[stream_id]
                del self.viewer_counts[stream_id]
    
    async def broadcast(self, stream_id: int, message: dict):
        if stream_id in self.active_connections:
            disconnected = set()
            for connection in self.active_connections[stream_id]:
                try:
                    await connection.send_json(message)
                except:
                    disconnected.add(connection)
            for conn in disconnected:
                self.disconnect(conn, stream_id)

manager = ConnectionManager()

@router.websocket("/{stream_id}")
async def live_websocket(
    websocket: WebSocket,
    stream_id: int,
    db: Session = Depends(get_db)
):
    stream = db.query(models.LiveStream).filter(models.LiveStream.id == stream_id).first()
    if not stream:
        await websocket.close(code=4004, reason="Stream not found")
        return
    
    if stream.status != "live":
        await websocket.close(code=4004, reason="Stream is not live")
        return
    
    await manager.connect(websocket, stream_id)
    
    await manager.broadcast(stream_id, {
        "type": "viewer_count",
        "count": manager.viewer_counts.get(stream_id, 0)
    })
    
    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type", "ping")
            
            if msg_type == "ping":
                await websocket.send_json({"type": "pong", "timestamp": datetime.utcnow().isoformat()})
            
            elif msg_type == "chat":
                message_text = data.get("message", "").strip()
                if not message_text or len(message_text) > 500:
                    continue
                
                if not stream.chat_enabled:
                    await websocket.send_json({"type": "error", "message": "Chat is disabled"})
                    continue
                
                user_id = data.get("user_id")
                username = data.get("username", "Anonymous")
                avatar_url = data.get("avatar_url")
                
                chat_msg = models.LiveChatMessage(
                    stream_id=stream_id,
                    user_id=user_id if user_id else None,
                    message=message_text
                )
                db.add(chat_msg)
                db.commit()
                
                await manager.broadcast(stream_id, {
                    "type": "chat",
                    "data": {
                        "id": chat_msg.id,
                        "user_id": user_id,
                        "username": username,
                        "avatar_url": avatar_url,
                        "message": message_text,
                        "created_at": datetime.utcnow().isoformat()
                    }
                })
            
            elif msg_type == "viewer_count_request":
                await websocket.send_json({
                    "type": "viewer_count",
                    "count": manager.viewer_counts.get(stream_id, 0)
                })
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, stream_id)
        await manager.broadcast(stream_id, {
            "type": "viewer_count",
            "count": manager.viewer_counts.get(stream_id, 0)
        })
    except Exception:
        manager.disconnect(websocket, stream_id)