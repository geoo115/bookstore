package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config holds application configuration
type Config struct {
	JWTSecret        string
	Port             string
	LogLevel         string
	BcryptCost       int
	TokenExpiryHours int
	ServiceName      string
	ServiceVersion   string
}

// Load loads configuration from environment variables and .env file
func Load() *Config {
	// Load .env file if it exists (ignore error if file doesn't exist)
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	config := &Config{
		JWTSecret:        getEnv("JWT_SECRET", "super-secret-key"),
		Port:             getEnv("PORT", "8002"),
		LogLevel:         getEnv("LOG_LEVEL", "info"),
		BcryptCost:       getEnvAsInt("BCRYPT_COST", 12),
		TokenExpiryHours: getEnvAsInt("TOKEN_EXPIRY_HOURS", 1),
		ServiceName:      getEnv("SERVICE_NAME", "user-service"),
		ServiceVersion:   getEnv("SERVICE_VERSION", "1.0.0"),
	}

	return config
}

// getEnv gets an environment variable with a fallback default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getEnvAsInt gets an environment variable as integer with a fallback default value
func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

// GetJWTKey returns the JWT signing key as bytes
func (c *Config) GetJWTKey() []byte {
	return []byte(c.JWTSecret)
}
