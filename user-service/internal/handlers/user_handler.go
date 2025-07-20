package handlers

import (
	"net/http"

	"github.com/geoo115/user-service/internal/models"
	"github.com/geoo115/user-service/internal/service"
	"github.com/gin-gonic/gin"
)

// UserHandler handles HTTP requests for user operations
type UserHandler struct {
	userService *service.UserService
}

// NewUserHandler creates a new user handler
func NewUserHandler(userService *service.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

// Login handles user login requests
func (h *UserHandler) Login(c *gin.Context) {
	var credentials models.Credentials
	if err := c.ShouldBindJSON(&credentials); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error: "Invalid request body",
		})
		return
	}

	response, err := h.userService.Login(credentials)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error: "Invalid credentials",
		})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetProfile handles get user profile requests
func (h *UserHandler) GetProfile(c *gin.Context) {
	username := c.GetString("username")
	if username == "" {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error: "User not authenticated",
		})
		return
	}

	user, err := h.userService.GetProfile(username)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error: "User not found",
		})
		return
	}

	c.JSON(http.StatusOK, user)
}

// UpdateProfile handles update user profile requests
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	username := c.GetString("username")
	if username == "" {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error: "User not authenticated",
		})
		return
	}

	var update models.UserProfileUpdate
	if err := c.ShouldBindJSON(&update); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error: "Invalid request body",
		})
		return
	}

	user, err := h.userService.UpdateProfile(username, update)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error: "User not found",
		})
		return
	}

	c.JSON(http.StatusOK, user)
}

// GetAllUsers handles get all users requests (admin only)
func (h *UserHandler) GetAllUsers(c *gin.Context) {
	username := c.GetString("username")
	if username == "" {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error: "User not authenticated",
		})
		return
	}

	users, err := h.userService.GetAllUsers(username)
	if err != nil {
		c.JSON(http.StatusForbidden, models.ErrorResponse{
			Error: "Admin access required",
		})
		return
	}

	c.JSON(http.StatusOK, users)
}

// Health handles health check requests
func (h *UserHandler) Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"service": "user-service",
	})
}
