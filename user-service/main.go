package main

import (
	"log"

	"github.com/geoo115/user-service/internal/config"
	"github.com/geoo115/user-service/internal/handlers"
	"github.com/geoo115/user-service/internal/middleware"
	"github.com/geoo115/user-service/internal/repository"
	"github.com/geoo115/user-service/internal/service"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration from .env file and environment variables
	cfg := config.Load()
	log.Printf("Starting %s v%s", cfg.ServiceName, cfg.ServiceVersion)
	log.Printf("JWT token expiry: %d hour(s)", cfg.TokenExpiryHours)

	// Initialize repository
	userRepo := repository.NewInMemoryUserRepository()

	// Initialize service
	userService := service.NewUserService(userRepo, cfg)

	// Initialize middleware
	authMiddleware := middleware.NewAuthMiddleware(cfg)

	// Initialize handlers
	userHandler := handlers.NewUserHandler(userService)

	// Initialize Gin router
	router := gin.Default()

	// Setup routes
	handlers.SetupRoutes(router, userHandler, authMiddleware)

	// Start server
	log.Printf("User Service starting on port %s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
