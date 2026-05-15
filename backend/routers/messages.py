from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List
from pydantic import BaseModel
from datetime import datetime

from database import get_db
from models import Message, User
from auth import require_seller

router = APIRouter()


class MessageOut(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    sender_name: str
    text: str
    is_read: bool
    created_at: str

    model_config = {"from_attributes": False}


class SellerOut(BaseModel):
    id: int
    name: str
    email: str
    unread_count: int


class SendMessage(BaseModel):
    receiver_id: int
    text: str


def _fmt(dt: datetime) -> str:
    return dt.isoformat()


@router.get("/sellers", response_model=List[SellerOut])
def get_sellers(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_seller),
):
    sellers = db.query(User).filter(
        User.is_seller == True,
        User.id != current_user.id,
    ).all()

    result = []
    for s in sellers:
        unread = db.query(Message).filter(
            Message.sender_id == s.id,
            Message.receiver_id == current_user.id,
            Message.is_read == False,
        ).count()
        result.append(SellerOut(id=s.id, name=s.name, email=s.email, unread_count=unread))
    return result


@router.get("/conversation/{user_id}", response_model=List[MessageOut])
def get_conversation(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_seller),
):
    msgs = (
        db.query(Message)
        .filter(
            or_(
                and_(Message.sender_id == current_user.id, Message.receiver_id == user_id),
                and_(Message.sender_id == user_id, Message.receiver_id == current_user.id),
            )
        )
        .order_by(Message.created_at)
        .all()
    )

    # Mark incoming as read
    for m in msgs:
        if m.receiver_id == current_user.id and not m.is_read:
            m.is_read = True
    db.commit()

    return [
        MessageOut(
            id=m.id,
            sender_id=m.sender_id,
            receiver_id=m.receiver_id,
            sender_name=m.sender.name,
            text=m.text,
            is_read=m.is_read,
            created_at=_fmt(m.created_at),
        )
        for m in msgs
    ]


@router.post("", response_model=MessageOut)
def send_message(
    data: SendMessage,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_seller),
):
    if not data.text.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    receiver = db.query(User).filter(User.id == data.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")

    msg = Message(
        sender_id=current_user.id,
        receiver_id=data.receiver_id,
        text=data.text.strip(),
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    return MessageOut(
        id=msg.id,
        sender_id=msg.sender_id,
        receiver_id=msg.receiver_id,
        sender_name=current_user.name,
        text=msg.text,
        is_read=msg.is_read,
        created_at=_fmt(msg.created_at),
    )


@router.get("/unread-count")
def unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_seller),
):
    count = db.query(Message).filter(
        Message.receiver_id == current_user.id,
        Message.is_read == False,
    ).count()
    return {"count": count}
