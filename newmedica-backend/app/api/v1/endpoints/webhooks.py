import stripe
import uuid
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.settings import settings
from app.db.session import get_session
from app.services.order_service import OrderService

router = APIRouter()


@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None),
    db: AsyncSession = Depends(get_session),
):
    """
    Stripe webhook endpoint to handle events.
    """
    payload = await request.body()

    if not stripe_signature:
        raise HTTPException(status_code=400, detail="Missing Stripe-Signature header")

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=stripe_signature,
            secret=settings.stripe_webhook_secret,
        )
    except ValueError as e:
        # Invalid payload
        raise HTTPException(status_code=400, detail=f"Invalid payload: {e}")
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        raise HTTPException(status_code=400, detail=f"Invalid signature: {e}")

    # Handle the event
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        client_reference_id = session.get("client_reference_id")

        if client_reference_id:
            try:
                order_id = uuid.UUID(client_reference_id)
                order_service = OrderService(db)
                await order_service.mark_order_paid(order_id=order_id)
                print(f"Order {order_id} payment succeeded and has been marked as paid.")
            except (ValueError, TypeError):
                print(f"Error: Invalid client_reference_id format: {client_reference_id}")

        else:
            # Log an error if the order_id is not found in the session
            print(f"Error: client_reference_id not found in checkout session {session.get('id')}")


    else:
        print(f"Unhandled event type {event['type']}")

    return {"status": "success"}
