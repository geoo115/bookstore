package main

import (
	"database/sql"
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

type Book struct {
	ID     string `json:"id"`
	Title  string `json:"title"`
	Author string `json:"author"`
}

type Claims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

var db *sql.DB
var jwtKey = []byte(os.Getenv("JWT_SECRET"))

func connectDB() {
	// Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using environment variables")
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://user:password@db:5432/bookstore?sslmode=disable"
	}

	var dbErr error
	db, dbErr = sql.Open("postgres", dbURL)
	if dbErr != nil {
		log.Fatal(dbErr)
	}

	if err := db.Ping(); err != nil {
		log.Fatal(err)
	}

	log.Println("Connected to database")
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

func addBook(c *gin.Context) {
	var b Book
	if err := c.ShouldBindJSON(&b); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}

	query := "INSERT INTO books (id, title, author) VALUES ($1, $2, $3)"
	_, err := db.Exec(query, b.ID, b.Title, b.Author)
	if err != nil {
		log.Printf("Database error: %v", err)
		c.JSON(500, gin.H{"error": "Failed to add book"})
		return
	}

	c.JSON(200, b)
}

func listBooks(c *gin.Context) {
	query := "SELECT id, title, author FROM books"
	rows, err := db.Query(query)
	if err != nil {
		log.Printf("Database error: %v", err)
		c.JSON(500, gin.H{"error": "Failed to fetch books"})
		return
	}
	defer rows.Close()

	var books []Book
	for rows.Next() {
		var b Book
		if err := rows.Scan(&b.ID, &b.Title, &b.Author); err != nil {
			log.Printf("Row scan error: %v", err)
			continue
		}
		books = append(books, b)
	}

	c.JSON(200, books)
}

func getBookByID(c *gin.Context) {
	id := c.Param("id")
	query := "SELECT id, title, author FROM books WHERE id = $1"
	row := db.QueryRow(query, id)

	var b Book
	if err := row.Scan(&b.ID, &b.Title, &b.Author); err != nil {
		if err == sql.ErrNoRows {
			c.JSON(404, gin.H{"error": "Book not found"})
		} else {
			log.Printf("Database error: %v", err)
			c.JSON(500, gin.H{"error": "Failed to fetch book"})
		}
		return
	}

	c.JSON(200, b)
}

func deleteBook(c *gin.Context) {
	id := c.Param("id")
	row := db.QueryRow("DELETE FROM books WHERE id=$1 RETURNING id", id)
	var deletedID string
	if err := row.Scan(&deletedID); err != nil {
		if err == sql.ErrNoRows {
			c.JSON(404, gin.H{"error": "Book not found"})
		} else {
			c.JSON(500, gin.H{"error": "Failed to delete book"})
		}
		return
	}
	c.JSON(200, gin.H{"message": "Book deleted successfully"})
}

func getBookStats(c *gin.Context) {
	var totalBooks int
	err := db.QueryRow("SELECT COUNT(*) FROM books").Scan(&totalBooks)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to get book statistics"})
		return
	}

	// Get books by author count
	rows, err := db.Query("SELECT author, COUNT(*) as count FROM books GROUP BY author ORDER BY count DESC LIMIT 10")
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to get author statistics"})
		return
	}
	defer rows.Close()

	type AuthorStats struct {
		Author string `json:"author"`
		Count  int    `json:"count"`
	}

	var authorStats []AuthorStats
	for rows.Next() {
		var stat AuthorStats
		if err := rows.Scan(&stat.Author, &stat.Count); err != nil {
			continue
		}
		authorStats = append(authorStats, stat)
	}

	stats := map[string]interface{}{
		"total_books":  totalBooks,
		"top_authors":  authorStats,
		"last_updated": time.Now(),
	}

	c.JSON(200, stats)
}

func main() {
	connectDB()
	defer db.Close()

	r := gin.Default()

	// Protected book routes
	books := r.Group("/books")
	books.Use(verifyJWT())
	{
		books.POST("/", addBook)
		books.GET("/", listBooks)
		books.GET("/:id", getBookByID)
		books.DELETE("/:id", deleteBook)
		books.GET("/stats", getBookStats)
	}

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	log.Println("Book Service on :8000")
	r.Run(":8000")
}
