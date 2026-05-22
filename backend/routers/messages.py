from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from database import get_db
from models import Message, User
from auth import require_user, require_seller

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


class ContactOut(BaseModel):
    id: int
    name: str
    email: str
    unread_count: int
    last_message: Optional[str] = None
    last_message_at: Optional[str] = None


class SendMessage(BaseModel):
    receiver_id: int
    text: str


def _fmt(dt: datetime) -> str:
    return dt.isoformat()


# ── Для клиентов: список продавцов ──────────────────────────────────
@router.get("/sellers", response_model=List[ContactOut])
def get_sellers(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),   # любой авторизованный
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
        last = (
            db.query(Message)
            .filter(or_(
                and_(Message.sender_id == current_user.id, Message.receiver_id == s.id),
                and_(Message.sender_id == s.id, Message.receiver_id == current_user.id),
            ))
            .order_by(Message.created_at.desc())
            .first()
        )
        result.append(ContactOut(
            id=s.id, name=s.name, email=s.email,
            unread_count=unread,
            last_message=last.text[:60] if last else None,
            last_message_at=_fmt(last.created_at) if last else None,
        ))
    # Сортируем: сначала с непрочитанными, потом по дате
    result.sort(key=lambda x: (-(x.unread_count > 0), x.last_message_at or '' ), reverse=False)
    result.sort(key=lambda x: x.unread_count, reverse=True)
    return result


# ── Для продавцов: список клиентов, написавших им ───────────────────
@router.get("/clients", response_model=List[ContactOut])
def get_clients(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_seller),
):
    # Все уникальные пользователи, с кем есть переписка
    sent_to = db.query(Message.receiver_id).filter(Message.sender_id == current_user.id).distinct()
    got_from = db.query(Message.sender_id).filter(Message.receiver_id == current_user.id).distinct()

    client_ids = set()
    for (uid,) in sent_to:
        client_ids.add(uid)
    for (uid,) in got_from:
        client_ids.add(uid)
    client_ids.discard(current_user.id)

    result = []
    for cid in client_ids:
        client = db.query(User).filter(User.id == cid).first()
        if not client:
            continue
        unread = db.query(Message).filter(
            Message.sender_id == cid,
            Message.receiver_id == current_user.id,
            Message.is_read == False,
        ).count()
        last = (
            db.query(Message)
            .filter(or_(
                and_(Message.sender_id == current_user.id, Message.receiver_id == cid),
                and_(Message.sender_id == cid, Message.receiver_id == current_user.id),
            ))
            .order_by(Message.created_at.desc())
            .first()
        )
        result.append(ContactOut(
            id=client.id, name=client.name, email=client.email,
            unread_count=unread,
            last_message=last.text[:60] if last else None,
            last_message_at=_fmt(last.created_at) if last else None,
        ))
    result.sort(key=lambda x: x.last_message_at or '', reverse=True)
    return result


# ── Переписка с конкретным пользователем ────────────────────────────
@router.get("/conversation/{user_id}", response_model=List[MessageOut])
def get_conversation(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),   # любой авторизованный
):
    msgs = (
        db.query(Message)
        .filter(or_(
            and_(Message.sender_id == current_user.id, Message.receiver_id == user_id),
            and_(Message.sender_id == user_id, Message.receiver_id == current_user.id),
        ))
        .order_by(Message.created_at)
        .all()
    )
    for m in msgs:
        if m.receiver_id == current_user.id and not m.is_read:
            m.is_read = True
    db.commit()

    return [
        MessageOut(
            id=m.id, sender_id=m.sender_id, receiver_id=m.receiver_id,
            sender_name=m.sender.name, text=m.text, is_read=m.is_read,
            created_at=_fmt(m.created_at),
        )
        for m in msgs
    ]


# ── Отправить сообщение ──────────────────────────────────────────────
@router.post("", response_model=MessageOut)
def send_message(
    data: SendMessage,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),   # любой авторизованный
):
    if not data.text.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    receiver = db.query(User).filter(User.id == data.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")

    msg = Message(sender_id=current_user.id, receiver_id=data.receiver_id, text=data.text.strip())
    db.add(msg)
    db.commit()
    db.refresh(msg)

    return MessageOut(
        id=msg.id, sender_id=msg.sender_id, receiver_id=msg.receiver_id,
        sender_name=current_user.name, text=msg.text, is_read=msg.is_read,
        created_at=_fmt(msg.created_at),
    )


# ── Кол-во непрочитанных ────────────────────────────────────────────
@router.get("/unread-count")
def unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),   # любой авторизованный
):
    count = db.query(Message).filter(
        Message.receiver_id == current_user.id,
        Message.is_read == False,
    ).count()
    return {"count": count}
