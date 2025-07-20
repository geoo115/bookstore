package models

import "github.com/golang-jwt/jwt/v5"

// User represents a user in the system
type User struct {
	Username  string `json:"username"`
	Email     string `json:"email"`
	FullName  string `json:"full_name"`
	Role      string `json:"role"`
	CreatedAt string `json:"created_at"`
}

// Credentials represents login credentials
type Credentials struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// Claims represents JWT claims
type Claims struct {
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

// UserProfileUpdate represents the data that can be updated in a user profile
type UserProfileUpdate struct {
	Email    string `json:"email"`
	FullName string `json:"full_name"`
}

// LoginResponse represents the response after successful login
type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error string `json:"error"`
}

// SuccessResponse represents a success response
type SuccessResponse struct {
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}
