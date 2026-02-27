from typing import Dict, Any, List
from uuid import UUID
import secrets
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.payment import Payment
from app.models.listing import Listing
from app.models.user import User
from app.models.enums import ListingType


class PaymentService:
    """
    Payment service for handling payment operations.
    This is a stub implementation - integrate with actual payment gateway (Paystack, Flutterwave, etc.)
    """
    
    @staticmethod
    def initiate_payment(user_id: UUID, payment_data: Any) -> Dict[str, Any]:
        """
        Initiate a payment transaction.
        
        Args:
            user_id: The ID of the user initiating the payment
            payment_data: PaymentInitiate schema with listing_id and amount
            
        Returns:
            Dict with payment initiation details including authorization_url and reference
        """
        # Generate a unique transaction reference
        reference = f"TXN_{secrets.token_urlsafe(16)}"
        
        # TODO: Integrate with actual payment gateway
        # For now, return a mock response
        return {
            "status": "success",
            "message": "Payment initiated successfully",
            "data": {
                "authorization_url": f"https://payment-gateway.example.com/pay/{reference}",
                "access_code": secrets.token_urlsafe(32),
                "reference": reference,
                "amount": payment_data.amount,
                "listing_id": str(payment_data.listing_id)
            }
        }
    
    @staticmethod
    def verify_payment(reference: str) -> Dict[str, Any]:
        """
        Verify a payment transaction.
        
        Args:
            reference: The transaction reference to verify
            
        Returns:
            Dict with payment verification status
        """
        # TODO: Integrate with actual payment gateway to verify transaction
        # For now, return a mock successful verification
        return {
            "status": "success",
            "message": "Payment verified successfully",
            "data": {
                "reference": reference,
                "amount": 10000,  # Mock amount in kobo/cents
                "status": "successful",
                "paid_at": "2026-02-17T07:44:03Z"
            }
        }
    
    @staticmethod
    def get_user_transactions(db: Session, user_id: UUID) -> List[Dict[str, Any]]:
        """
        Get transaction history for a user (both as buyer and seller).
        """
        # Transactions where user is the buyer
        bought = db.query(Payment, Listing, User).join(Listing, Payment.listing_id == Listing.id).join(User, Listing.owner_id == User.id).filter(Payment.user_id == user_id).all()
        
        # Transactions where user is the seller
        sold = db.query(Payment, Listing, User).join(Listing, Payment.listing_id == Listing.id).join(User, Payment.user_id == User.id).filter(Listing.owner_id == user_id).all()
        
        history = []
        
        for p, l, u in bought:
            history.append({
                "id": str(p.id),
                "amount": p.amount,
                "status": p.status,
                "transaction_reference": p.transaction_reference,
                "created_at": p.created_at,
                "listing_title": l.title,
                "listing_type": l.type,
                "transaction_type": "buy",
                "other_party_name": u.full_name
            })
            
        for p, l, u in sold:
            history.append({
                "id": str(p.id),
                "amount": p.amount,
                "status": p.status,
                "transaction_reference": p.transaction_reference,
                "created_at": p.created_at,
                "listing_title": l.title,
                "listing_type": l.type,
                "transaction_type": "sell" if l.type == ListingType.product else "service",
                "other_party_name": u.full_name
            })
            
        # Sort by creation date descending
        history.sort(key=lambda x: x["created_at"], reverse=True)
        return history

    @staticmethod
    def handle_webhook(reference: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle payment gateway webhook notifications.
        
        Args:
            reference: The transaction reference
            payload: The webhook payload from payment gateway
            
        Returns:
            Dict with webhook processing status
        """
        # TODO: Verify webhook signature from payment gateway
        # TODO: Update payment status in database
        # TODO: Trigger any post-payment actions (notifications, etc.)
        
        return {
            "status": "success",
            "message": "Webhook processed successfully",
            "reference": reference
        }

