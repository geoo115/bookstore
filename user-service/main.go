package main

import (
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var jwtKey = []byte(os.Getenv("JWT_SECRET"))

type Credentials struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type Claims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

type User struct {
	Username  string `json:"username"`
	Email     string `json:"email"`
	FullName  string `json:"full_name"`
	Role      string `json:"role"`
	CreatedAt string `json:"created_at"`
}

type UserProfileUpdate struct {
	Email    string `json:"email"`
	FullName string `json:"full_name"`
}

// Dummy user data (in production, this would be in a database)
var users = map[string]User{
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

func verifyJWT() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			c.JSON(401, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
			tokenString = tokenString[7:]
		} else {
			c.JSON(401, gin.H{"error": "Invalid authorization header format"})
			c.Abort()
			return
		}

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		if err != nil || !token.Valid {
			c.JSON(401, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		c.Set("username", claims.Username)
		c.Next()
	}
}

func getUserProfile(c *gin.Context) {
	username := c.GetString("username")
	user, exists := users[username]
	if !exists {
		c.JSON(404, gin.H{"error": "User not found"})
		return
	}
	c.JSON(200, user)
}

func updateUserProfile(c *gin.Context) {
	username := c.GetString("username")
	user, exists := users[username]
	if !exists {
		c.JSON(404, gin.H{"error": "User not found"})
		return
	}

	var update UserProfileUpdate
	if err := c.ShouldBindJSON(&update); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}

	user.Email = update.Email
	user.FullName = update.FullName
	users[username] = user

	c.JSON(200, user)
}

func getAllUsers(c *gin.Context) {
	username := c.GetString("username")
	user, exists := users[username]
	if !exists || user.Role != "admin" {
		c.JSON(403, gin.H{"error": "Admin access required"})
		return
	}

	var userList []User
	for _, user := range users {
		userList = append(userList, user)
	}
	c.JSON(200, userList)
}

func login(c *gin.Context) {
	var creds Credentials
	if err := c.ShouldBindJSON(&creds); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}

	// Dummy validation
	if creds.Username != "admin" || creds.Password != "password" {
		c.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	expirationTime := time.Now().Add(1 * time.Hour)
	claims := &Claims{
		Username: creds.Username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		c.JSON(500, gin.H{"error": "Could not generate token"})
		return
	}

	c.JSON(200, gin.H{"token": tokenString})
}

func main() {
	r := gin.Default()

	// Public endpoints
	r.POST("/login", login)
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Protected endpoints
	protected := r.Group("/")
	protected.Use(verifyJWT())
	{
		protected.GET("/profile", getUserProfile)
		protected.PUT("/profile", updateUserProfile)
		protected.GET("/users", getAllUsers)
	}

	log.Println("User Service on :8002")
	r.Run(":8002")
}
