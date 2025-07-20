package repository

import (
	"errors"
	"sync"

	"github.com/geoo115/user-service/internal/models"
)

// UserRepository defines the interface for user data operations
type UserRepository interface {
	GetByUsername(username string) (*models.User, error)
	GetAll() ([]models.User, error)
	Update(username string, update models.UserProfileUpdate) (*models.User, error)
	ValidateCredentials(username, password string) (*models.User, error)
	Create(user models.User) error
}

// InMemoryUserRepository implements UserRepository using in-memory storage
type InMemoryUserRepository struct {
	users map[string]models.User
	mutex sync.RWMutex
}

// NewInMemoryUserRepository creates a new in-memory user repository
func NewInMemoryUserRepository() *InMemoryUserRepository {
	repo := &InMemoryUserRepository{
		users: make(map[string]models.User),
		mutex: sync.RWMutex{},
	}

	// Initialize with default users
	repo.seedData()
	return repo
}

// seedData initializes the repository with default users
func (r *InMemoryUserRepository) seedData() {
	defaultUsers := map[string]models.User{
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
	}

	for username, user := range defaultUsers {
		r.users[username] = user
	}
}

// GetByUsername retrieves a user by username
func (r *InMemoryUserRepository) GetByUsername(username string) (*models.User, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	user, exists := r.users[username]
	if !exists {
		return nil, errors.New("user not found")
	}

	return &user, nil
}

// GetAll retrieves all users
func (r *InMemoryUserRepository) GetAll() ([]models.User, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	users := make([]models.User, 0, len(r.users))
	for _, user := range r.users {
		users = append(users, user)
	}

	return users, nil
}

// Update updates a user's profile information
func (r *InMemoryUserRepository) Update(username string, update models.UserProfileUpdate) (*models.User, error) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	user, exists := r.users[username]
	if !exists {
		return nil, errors.New("user not found")
	}

	user.Email = update.Email
	user.FullName = update.FullName
	r.users[username] = user

	return &user, nil
}

// ValidateCredentials validates user credentials (simplified for demo)
func (r *InMemoryUserRepository) ValidateCredentials(username, password string) (*models.User, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	// In a real application, you would hash passwords and compare hashes
	// This is simplified for demo purposes
	validCredentials := map[string]string{
		"admin": "password",
		"user":  "password",
	}

	if validPassword, exists := validCredentials[username]; exists && validPassword == password {
		if user, userExists := r.users[username]; userExists {
			return &user, nil
		}
	}

	return nil, errors.New("invalid credentials")
}

// Create creates a new user
func (r *InMemoryUserRepository) Create(user models.User) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	if _, exists := r.users[user.Username]; exists {
		return errors.New("user already exists")
	}

	r.users[user.Username] = user
	return nil
}
