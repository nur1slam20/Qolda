import logging
import os
from typing import Optional

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import require_seller
from models import User

load_dotenv()

logger = logging.getLogger(__name__)
router = APIRouter()

_ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
_MODEL         = "claude-haiku-4-5"   # быстрая и умная модель


async def _claude(system: str, user_msg: str) -> str:
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=503, detail="ANTHROPIC_API_KEY не настроен в .env")

    async with httpx.AsyncClient(timeout=30.0) as c:
        resp = await c.post(
            _ANTHROPIC_URL,
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": _MODEL,
                "max_tokens": 1024,
                "system": system,
                "messages": [{"role": "user", "content": user_msg}],
            },
        )

    if resp.status_code != 200:
        logger.error("Anthropic error %s: %s", resp.status_code, resp.text)
        raise HTTPException(status_code=502, detail=f"AI error: {resp.text[:300]}")

    return resp.json()["content"][0]["text"]


class DescriptionRequest(BaseModel):
    product_name: str
    category: Optional[str] = None
    details: Optional[str] = None


class ChatRequest(BaseModel):
    message: str


class AIResponse(BaseModel):
    result: str


@router.post("/generate-description", response_model=AIResponse)
async def generate_description(
    req: DescriptionRequest,
    _: User = Depends(require_seller),
):
    system = (
        "Ты — профессиональный маркетолог казахстанского маркетплейса QOLDA. "
        "Пиши продающие описания товаров на русском языке. "
        "Структура: 1-2 вступительных предложения, затем список из 4-5 преимуществ со значком ✓, "
        "краткий призыв к действию. Без лишней воды — конкретно и убедительно."
    )
    user_msg = "\n".join(filter(None, [
        f"Напиши продающее описание товара: {req.product_name}",
        f"Категория: {req.category}" if req.category else "",
        f"Характеристики: {req.details}" if req.details else "",
    ]))
    result = await _claude(system, user_msg)
    return AIResponse(result=result)


@router.post("/chat", response_model=AIResponse)
async def ai_chat(req: ChatRequest, _: User = Depends(require_seller)):
    system = (
        "Ты — AI-ассистент продавцов на маркетплейсе QOLDA (Казахстан). "
        "Помогаешь с продажами, маркетингом, управлением товарами и ценообразованием. "
        "Отвечай на русском языке, кратко и по делу. "
        "Если вопрос не по теме — вежливо направь к теме продаж."
    )
    result = await _claude(system, req.message)
    return AIResponse(result=result)
