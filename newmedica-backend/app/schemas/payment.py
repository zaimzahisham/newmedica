from pydantic import BaseModel

class PaymentResponse(BaseModel):
    payment_url: str
