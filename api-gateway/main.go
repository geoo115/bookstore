package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var jwtKey = []byte(os.Getenv("JWT_SECRET"))

func verifyJWT() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenStr := strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer ")
		if tokenStr == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing token"})
			return
		}

		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		c.Next()
	}
}

func proxyService(serviceURL string, stripPrefix string) gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path
		if stripPrefix != "" && strings.HasPrefix(path, stripPrefix) {
			path = strings.TrimPrefix(path, stripPrefix)
		}
		fullURL := fmt.Sprintf("%s%s", serviceURL, path)
		log.Printf("Proxying request to: %s", fullURL)

		req, err := http.NewRequest(c.Request.Method, fullURL, c.Request.Body)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request"})
			return
		}
		req.Header = c.Request.Header

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			log.Printf("Error proxying request: %v", err)
			c.JSON(http.StatusBadGateway, gin.H{"error": "Service unavailable"})
			return
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response body"})
			return
		}
		c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), body)
	}
}

func main() {
	r := gin.Default()

	// Enable CORS for the frontend
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Get service URLs from environment variables
	userServiceURL := os.Getenv("USER_SERVICE_URL")
	bookServiceURL := os.Getenv("BOOK_SERVICE_URL")
	orderServiceURL := os.Getenv("ORDER_SERVICE_URL")

	if userServiceURL == "" {
		userServiceURL = "http://user-service:8002"
	}
	if bookServiceURL == "" {
		bookServiceURL = "http://book-service:8000"
	}
	if orderServiceURL == "" {
		orderServiceURL = "http://order-service:8081"
	}

	// Health endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "message": "API Gateway is healthy", "timestamp": time.Now()})
	})

	// Public route for authentication (no /api prefix)
	r.POST("/login", proxyService(userServiceURL, ""))

	// Protected group
	auth := r.Group("/", verifyJWT())
	{
		// User service routes
		auth.GET("/profile", proxyService(userServiceURL, ""))
		auth.PUT("/profile", proxyService(userServiceURL, ""))
		auth.GET("/users", proxyService(userServiceURL, ""))

		// Book service routes
		auth.GET("/books", proxyService(bookServiceURL, ""))
		auth.POST("/books", proxyService(bookServiceURL, ""))
		auth.GET("/books/:id", proxyService(bookServiceURL, ""))
		auth.DELETE("/books/:id", proxyService(bookServiceURL, ""))
		auth.GET("/books/stats", proxyService(bookServiceURL, ""))

		// Order service routes
		auth.POST("/order", proxyService(orderServiceURL, ""))
		auth.GET("/orders", proxyService(orderServiceURL, ""))
		auth.GET("/orders/all", proxyService(orderServiceURL, ""))
	}

	fmt.Println("API Gateway (GIN) running on :8080")
	r.Run(":8080")
}
