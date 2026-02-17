/**
 * Authentication & User Types
 * 
 * ALIGNED WITH BACKEND:
 * - app/schemas/user.py
 * - app/models/enums.py (UserRole)
 */

// ============================================================================
// ENUMS (Must match backend exactly)
// ============================================================================

/**
 * User role enum - MATCHES backend UserRole
 * Backend: app/models/enums.py
 */
export enum UserRole {
    STUDENT = 'student',  // Changed from 'user' to 'student'
    ADMIN = 'admin'
}

// ============================================================================
// USER TYPES
// ============================================================================

/**
 * User interface - MATCHES backend UserResponse
 * Backend: app/schemas/user.py - UserResponse
 */
export interface User {
    id: string;                    // UUID from backend
    email: string;
    full_name: string;             // Changed from fullName (snake_case in backend)
    university_id: string;         // Changed from universityId
    role: UserRole;                // Using enum instead of union type
    is_active: boolean;            // Added from backend
    created_at: string;            // ISO datetime string
    updated_at: string;            // Added - new field in backend
}

/**
 * Login credentials - MATCHES backend UserLogin
 * Backend: app/schemas/user.py - UserLogin
 */
export interface LoginCredentials {
    email: string;
    password: string;
}

/**
 * Registration credentials - MATCHES backend UserCreate
 * Backend: app/schemas/user.py - UserCreate
 */
export interface RegisterCredentials {
    email: string;
    password: string;
    full_name: string;             // Changed from fullName
    university_id: string;         // Changed from universityId
    role?: UserRole;               // Optional, defaults to student
    is_active?: boolean;           // Optional, defaults to true
}

/**
 * Token response - MATCHES backend TokenResponse
 * Backend: app/schemas/user.py - TokenResponse
 */
export interface TokenResponse {
    access_token: string;          // Changed from accessToken
    refresh_token: string;         // Changed from refreshToken
    token_type: string;            // Added from backend
}

/**
 * Auth response (login/register) - CUSTOM (not in backend)
 * Backend returns TokenResponse, we combine with user data
 */
export interface AuthResponse {
    user: User;
    access_token: string;
    refresh_token: string;
    token_type: string;
}

// ============================================================================
// CONTEXT TYPES
// ============================================================================

export interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert backend User to frontend User (if needed for camelCase conversion)
 */
export function mapBackendUser(backendUser: any): User {
    return {
        id: backendUser.id,
        email: backendUser.email,
        full_name: backendUser.full_name,
        university_id: backendUser.university_id,
        role: backendUser.role as UserRole,
        is_active: backendUser.is_active,
        created_at: backendUser.created_at,
        updated_at: backendUser.updated_at
    };
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null): boolean {
    return user?.role === UserRole.ADMIN;
}

/**
 * Check if user is student
 */
export function isStudent(user: User | null): boolean {
    return user?.role === UserRole.STUDENT;
}
