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
	cfg := config.Load()
	log.Printf("Starting %s v%s", cfg.ServiceName, cfg.ServiceVersion)
	log.Printf("JWT token expiry: %d hour(s)", cfg.TokenExpiryHours)

	// Use the simple repo and service
	userRepo := repository.NewUserRepo()
	userService := service.NewUserService(userRepo, cfg)
	authMiddleware := middleware.NewAuthMiddleware(cfg)
	userHandler := handlers.NewUserHandler(userService)

	router := gin.Default()
	handlers.SetupRoutes(router, userHandler, authMiddleware)

	log.Printf("User Service starting on port %s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
