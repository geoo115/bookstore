package handlers

import (
	"github.com/geoo115/user-service/internal/middleware"
	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all routes for the user service
func SetupRoutes(
	router *gin.Engine,
	userHandler *UserHandler,
	authMiddleware *middleware.AuthMiddleware,
) {
	// Apply CORS middleware globally
	router.Use(middleware.CORS())

	// Public routes
	public := router.Group("/")
	{
		public.POST("/login", userHandler.Login)
		public.GET("/health", userHandler.Health)
	}

	// Protected routes (require JWT authentication)
	protected := router.Group("/")
	protected.Use(authMiddleware.VerifyJWT())
	{
		protected.GET("/profile", userHandler.GetProfile)
		protected.PUT("/profile", userHandler.UpdateProfile)

		// Admin-only routes
		admin := protected.Group("/")
		admin.Use(authMiddleware.RequireAdmin())
		{
			admin.GET("/users", userHandler.GetAllUsers)
		}
	}
}
