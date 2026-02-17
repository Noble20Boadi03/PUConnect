/**
 * Payment Types
 * 
 * ALIGNED WITH BACKEND:
 * - app/schemas/payment.py
 * - app/models/enums.py (PaymentStatus)
 */

// ============================================================================
// ENUMS (Must match backend exactly)
// ============================================================================

/**
 * Payment status enum - MATCHES backend PaymentStatus
 * Backend: app/models/enums.py
 */
export enum PaymentStatus {
    PENDING = 'pending',
    SUCCESSFUL = 'successful',
    FAILED = 'failed'
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

/**
 * Payment interface - MATCHES backend PaymentResponse
 * Backend: app/schemas/payment.py - PaymentResponse
 */
export interface Payment {
    id: string;                    // UUID from backend
    user_id: string;
    listing_id: string;
    amount: number;                // Must be > 0
    status: PaymentStatus;
    transaction_reference: string;
    created_at: string;            // ISO datetime string
    updated_at: string;            // Added - new field in backend
}

/**
 * Payment initiation data - MATCHES backend PaymentInitiate
 * Backend: app/schemas/payment.py - PaymentInitiate
 */
export interface PaymentInitiate {
    listing_id: string;
    amount: number;                // Must be > 0
}

/**
 * Payment creation data - MATCHES backend PaymentCreate
 * Backend: app/schemas/payment.py - PaymentCreate
 */
export interface PaymentCreate {
    listing_id: string;
    amount: number;
    status?: PaymentStatus;
    transaction_reference: string;
}

/**
 * Payment update data - MATCHES backend PaymentUpdate
 * Backend: app/schemas/payment.py - PaymentUpdate
 */
export interface PaymentUpdate {
    status?: PaymentStatus;
    transaction_reference?: string;
}

/**
 * Payment initiation response (from payment gateway)
 */
export interface PaymentInitiationResponse {
    authorization_url: string;     // URL to redirect user for payment
    access_code: string;
    reference: string;
}

/**
 * Payment verification response
 */
export interface PaymentVerificationResponse {
    status: PaymentStatus;
    amount: number;
    reference: string;
    paid_at?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert backend Payment to frontend Payment (if needed)
 */
export function mapBackendPayment(backendPayment: any): Payment {
    return {
        id: backendPayment.id,
        user_id: backendPayment.user_id,
        listing_id: backendPayment.listing_id,
        amount: backendPayment.amount,
        status: backendPayment.status as PaymentStatus,
        transaction_reference: backendPayment.transaction_reference,
        created_at: backendPayment.created_at,
        updated_at: backendPayment.updated_at
    };
}

/**
 * Check if payment is pending
 */
export function isPending(payment: Payment): boolean {
    return payment.status === PaymentStatus.PENDING;
}

/**
 * Check if payment is successful
 */
export function isSuccessful(payment: Payment): boolean {
    return payment.status === PaymentStatus.SUCCESSFUL;
}

/**
 * Check if payment failed
 */
export function isFailed(payment: Payment): boolean {
    return payment.status === PaymentStatus.FAILED;
}

/**
 * Format amount for display
 */
export function formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
    }).format(amount);
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: PaymentStatus): string {
    switch (status) {
        case PaymentStatus.PENDING:
            return 'yellow';
        case PaymentStatus.SUCCESSFUL:
            return 'green';
        case PaymentStatus.FAILED:
            return 'red';
        default:
            return 'gray';
    }
}

/**
 * Get status label for display
 */
export function getStatusLabel(status: PaymentStatus): string {
    switch (status) {
        case PaymentStatus.PENDING:
            return 'Pending';
        case PaymentStatus.SUCCESSFUL:
            return 'Successful';
        case PaymentStatus.FAILED:
            return 'Failed';
        default:
            return 'Unknown';
    }
}
