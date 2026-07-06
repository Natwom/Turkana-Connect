import { useEffect, useRef, useState, useCallback } from 'react'

const useWebSocket = (url, options = {}) => {
  const { onMessage, onConnect, onDisconnect, onError, reconnectInterval = 3000, autoReconnect = true } = options
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const wsRef = useRef(null)
  const reconnectTimerRef = useRef(null)
  const shouldReconnect = useRef(true)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        onConnect?.()
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setLastMessage(data)
          onMessage?.(data)
        } catch (err) {
          setLastMessage(event.data)
          onMessage?.(event.data)
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        onDisconnect?.()
        if (autoReconnect && shouldReconnect.current) {
          reconnectTimerRef.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        }
      }

      ws.onerror = (error) => {
        onError?.(error)
      }
    } catch (err) {
      onError?.(err)
      if (autoReconnect && shouldReconnect.current) {
        reconnectTimerRef.current = setTimeout(() => {
          connect()
        }, reconnectInterval)
      }
    }
  }, [url, onMessage, onConnect, onDisconnect, onError, reconnectInterval, autoReconnect])

  const disconnect = useCallback(() => {
    shouldReconnect.current = false
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setIsConnected(false)
  }, [])

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data))
      return true
    }
    return false
  }, [])

  useEffect(() => {
    shouldReconnect.current = true
    connect()
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return { isConnected, lastMessage, send, connect, disconnect }
}

export default useWebSocket