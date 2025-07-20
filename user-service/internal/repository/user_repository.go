package repository

import (
	"errors"

	"github.com/geoo115/user-service/internal/models"
)

// UserRepo is a simple in-memory user store
type UserRepo struct {
	users map[string]models.User
}

// NewUserRepo creates a new simple user repo with demo users
func NewUserRepo() *UserRepo {
	return &UserRepo{
		users: map[string]models.User{
			"admin": {
				Username:  "admin",
				Email:     "admin@bookstore.com",
				FullName:  "Administrator",
				Role:      "admin",
				CreatedAt: "2024-01-01T00:00:00Z",
			},
			"user": {
				Username:  "user",
				Email:     "user@bookstore.com",
				FullName:  "Regular User",
				Role:      "user",
				CreatedAt: "2024-01-01T00:00:00Z",
			},
		},
	}
}

// GetByUsername returns a user by username
func (r *UserRepo) GetByUsername(username string) (*models.User, error) {
	user, ok := r.users[username]
	if !ok {
		return nil, errors.New("user not found")
	}
	return &user, nil
}

// GetAll returns all users
func (r *UserRepo) GetAll() []models.User {
	users := make([]models.User, 0, len(r.users))
	for _, user := range r.users {
		users = append(users, user)
	}
	return users
}

// Update updates a user's profile
func (r *UserRepo) Update(username string, update models.UserProfileUpdate) (*models.User, error) {
	user, ok := r.users[username]
	if !ok {
		return nil, errors.New("user not found")
	}
	user.Email = update.Email
	user.FullName = update.FullName
	r.users[username] = user
	return &user, nil
}

// ValidateCredentials checks username and password (demo only)
func (r *UserRepo) ValidateCredentials(username, password string) (*models.User, error) {
	if (username == "admin" || username == "user") && password == "password" {
		return r.GetByUsername(username)
	}
	return nil, errors.New("invalid credentials")
}

// Create adds a new user
func (r *UserRepo) Create(user models.User) error {
	if _, exists := r.users[user.Username]; exists {
		return errors.New("user already exists")
	}
	r.users[user.Username] = user
	return nil
}
