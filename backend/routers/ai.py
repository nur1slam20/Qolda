import logging
import os
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import require_seller
from models import User

logger = logging.getLogger(__name__)
router = APIRouter()

_API_URL = "https://api.anthropic.com/v1/messages"
_MODEL   = "claude-3-haiku-20240307"


async def _claude(messages: list[dict], system: str = "") -> str:
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=503, detail="ANTHROPIC_API_KEY не настроен")

    payload: dict = {"model": _MODEL, "max_tokens": 1024, "messages": messages}
    if system:
        payload["system"] = system

    async with httpx.AsyncClient(timeout=30.0) as c:
        resp = await c.post(
            _API_URL,
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json=payload,
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
        "Ты — профессиональный маркетолог для казахстанского маркетплейса QOLDA. "
        "Пиши продающие описания товаров на русском языке. "
        "Структура: 1-2 вступительных предложения, затем список из 4-5 преимуществ со значком ✓, "
        "краткий призыв к действию. Без лишней воды — конкретно и убедительно."
    )
    parts = [f"Напиши продающее описание товара: {req.product_name}"]
    if req.category:
        parts.append(f"Категория: {req.category}")
    if req.details:
        parts.append(f"Характеристики: {req.details}")
    result = await _claude([{"role": "user", "content": "\n".join(parts)}], system)
    return AIResponse(result=result)


@router.post("/chat", response_model=AIResponse)
async def ai_chat(req: ChatRequest, _: User = Depends(require_seller)):
    system = (
        "Ты — AI-ассистент продавцов на маркетплейсе QOLDA (Казахстан). "
        "Помогаешь с продажами, маркетингом, управлением товарами и ценообразованием. "
        "Отвечай на русском языке, кратко и по делу."
    )
    result = await _claude([{"role": "user", "content": req.message}], system)
    return AIResponse(result=result)
