package service

import (
	"time"

	"github.com/geoo115/user-service/internal/config"
	"github.com/geoo115/user-service/internal/models"
	"github.com/geoo115/user-service/internal/repository"
	"github.com/golang-jwt/jwt/v5"
)

// UserService is a simple service struct
type UserService struct {
	repo   *repository.UserRepo
	config *config.Config
}

// NewUserService creates a new user service
func NewUserService(repo *repository.UserRepo, config *config.Config) *UserService {
	return &UserService{
		repo:   repo,
		config: config,
	}
}

// Login authenticates a user and returns a JWT token
func (s *UserService) Login(credentials models.Credentials) (*models.LoginResponse, error) {
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
func (s *UserService) GetProfile(username string) (*models.User, error) {
	return s.repo.GetByUsername(username)
}

// UpdateProfile updates a user's profile information
func (s *UserService) UpdateProfile(username string, update models.UserProfileUpdate) (*models.User, error) {
	return s.repo.Update(username, update)
}

// GetAllUsers retrieves all users (admin only)
func (s *UserService) GetAllUsers(requestingUsername string) ([]models.User, error) {
	requestingUser, err := s.repo.GetByUsername(requestingUsername)
	if err != nil {
		return nil, err
	}
	if requestingUser.Role != "admin" {
		return nil, jwt.ErrTokenInvalidClaims
	}
	users := s.repo.GetAll()
	return users, nil
}

// generateJWT creates a new JWT token for the user
func (s *UserService) generateJWT(username, role string) (string, error) {
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
