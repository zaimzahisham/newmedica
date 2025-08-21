from pydantic import BaseModel
from typing import Optional
import uuid

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    sub: Optional[uuid.UUID] = None