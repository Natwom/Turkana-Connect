from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("/", response_model=List[schemas.CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    try:
        categories = db.query(models.Category).filter(models.Category.is_active == True).all()
        
        # Enrich each category with real counts
        result = []
        for cat in categories:
            cat_data = schemas.CategoryResponse.model_validate(cat).model_dump()
            
            # Count approved songs in this category
            cat_data["song_count"] = db.query(models.Song).filter(
                models.Song.category_id == cat.id,
                models.Song.is_approved == True
            ).count()
            
            # Count unique artists in this category
            cat_data["artist_count"] = db.query(models.Song.artist_id).filter(
                models.Song.category_id == cat.id,
                models.Song.is_approved == True,
                models.Song.artist_id != None
            ).distinct().count()
            
            result.append(cat_data)
        
        return result
        
    except Exception as e:
        import traceback
        print(f"ERROR in list_categories: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@router.get("/{category_id}", response_model=schemas.CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    cat = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    
    cat_data = schemas.CategoryResponse.model_validate(cat).model_dump()
    cat_data["song_count"] = db.query(models.Song).filter(
        models.Song.category_id == cat.id,
        models.Song.is_approved == True
    ).count()
    cat_data["artist_count"] = db.query(models.Song.artist_id).filter(
        models.Song.category_id == cat.id,
        models.Song.is_approved == True,
        models.Song.artist_id != None
    ).distinct().count()
    
    return cat_data

@router.post("/", response_model=schemas.CategoryResponse, status_code=201)
def create_category(
    category: schemas.CategoryCreate,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    db_category = models.Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category