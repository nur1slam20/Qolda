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

_GROQ_URL   = "https://api.groq.com/openai/v1/chat/completions"
_MODEL      = "llama-3.1-8b-instant"   # бесплатная быстрая модель


async def _groq(messages: list[dict]) -> str:
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY не настроен в .env")

    async with httpx.AsyncClient(timeout=30.0) as c:
        resp = await c.post(
            _GROQ_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": _MODEL,
                "messages": messages,
                "max_tokens": 1024,
                "temperature": 0.7,
            },
        )

    if resp.status_code != 200:
        logger.error("Groq error %s: %s", resp.status_code, resp.text)
        raise HTTPException(status_code=502, detail=f"AI error: {resp.text[:300]}")

    return resp.json()["choices"][0]["message"]["content"]


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
    messages = [
        {
            "role": "system",
            "content": (
                "Ты — профессиональный маркетолог казахстанского маркетплейса QOLDA. "
                "Пиши продающие описания товаров на русском языке. "
                "Структура: 1-2 вступительных предложения, затем список из 4-5 преимуществ со значком ✓, "
                "краткий призыв к действию. Без лишней воды — конкретно и убедительно."
            ),
        },
        {
            "role": "user",
            "content": "\n".join(filter(None, [
                f"Напиши продающее описание товара: {req.product_name}",
                f"Категория: {req.category}" if req.category else "",
                f"Характеристики: {req.details}" if req.details else "",
            ])),
        },
    ]
    result = await _groq(messages)
    return AIResponse(result=result)


@router.post("/chat", response_model=AIResponse)
async def ai_chat(req: ChatRequest, _: User = Depends(require_seller)):
    messages = [
        {
            "role": "system",
            "content": (
                "Ты — AI-ассистент продавцов на маркетплейсе QOLDA (Казахстан). "
                "Помогаешь с продажами, маркетингом, управлением товарами и ценообразованием. "
                "Отвечай на русском языке, кратко и по делу. "
                "Если вопрос не по теме — вежливо направь к теме продаж."
            ),
        },
        {"role": "user", "content": req.message},
    ]
    result = await _groq(messages)
    return AIResponse(result=result)
