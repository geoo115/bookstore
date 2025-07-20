package service

import (
	"time"

	"github.com/geoo115/user-service/internal/config"
	"github.com/geoo115/user-service/internal/models"
	"github.com/geoo115/user-service/internal/repository"
	"github.com/golang-jwt/jwt/v5"
)

// UserService defines the interface for user business logic
type UserService interface {
	Login(credentials models.Credentials) (*models.LoginResponse, error)
	GetProfile(username string) (*models.User, error)
	UpdateProfile(username string, update models.UserProfileUpdate) (*models.User, error)
	GetAllUsers(requestingUsername string) ([]models.User, error)
}

// UserServiceImpl implements the UserService interface
type UserServiceImpl struct {
	repo   repository.UserRepository
	config *config.Config
}

// NewUserService creates a new user service
func NewUserService(repo repository.UserRepository, config *config.Config) UserService {
	return &UserServiceImpl{
		repo:   repo,
		config: config,
	}
}

// Login authenticates a user and returns a JWT token
func (s *UserServiceImpl) Login(credentials models.Credentials) (*models.LoginResponse, error) {
	user, err := s.repo.ValidateCredentials(credentials.Username, credentials.Password)
	if err != nil {
		return nil, err
	}

	token, err := s.generateJWT(user.Username, user.Role)
	if err != nil {
		return nil, err
	}

	return &models.LoginResponse{
		Token: token,
		User:  *user,
	}, nil
}

// GetProfile retrieves a user's profile
func (s *UserServiceImpl) GetProfile(username string) (*models.User, error) {
	return s.repo.GetByUsername(username)
}

// UpdateProfile updates a user's profile information
func (s *UserServiceImpl) UpdateProfile(username string, update models.UserProfileUpdate) (*models.User, error) {
	return s.repo.Update(username, update)
}

// GetAllUsers retrieves all users (admin only)
func (s *UserServiceImpl) GetAllUsers(requestingUsername string) ([]models.User, error) {
	// Check if requesting user is admin
	requestingUser, err := s.repo.GetByUsername(requestingUsername)
	if err != nil {
		return nil, err
	}

	if requestingUser.Role != "admin" {
		return nil, jwt.ErrTokenInvalidClaims
	}

	return s.repo.GetAll()
}

// generateJWT creates a new JWT token for the user
func (s *UserServiceImpl) generateJWT(username, role string) (string, error) {
	expirationTime := time.Now().Add(time.Duration(s.config.TokenExpiryHours) * time.Hour)
	claims := &models.Claims{
		Username: username,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.config.GetJWTKey())
}
