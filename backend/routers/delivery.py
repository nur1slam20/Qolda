from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import DeliveryService
from schemas import DeliveryServiceOut

router = APIRouter()


@router.get("", response_model=List[DeliveryServiceOut])
def get_delivery_services(db: Session = Depends(get_db)):
    return db.query(DeliveryService).filter(DeliveryService.is_active == True).all()
