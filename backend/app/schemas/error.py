from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class ErrorDetail(BaseModel):
    field: str
    message: str


class ErrorResponse(BaseModel):
    code: str
    message: str
    details: Optional[list[ErrorDetail]] = None
