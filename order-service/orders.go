package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/streadway/amqp"
)

var jwtKey = []byte(os.Getenv("JWT_SECRET"))

type Order struct {
	BookID string `json:"book_id"`
}

type OrderHistory struct {
	ID         string    `json:"id"`
	BookID     string    `json:"book_id"`
	BookTitle  string    `json:"book_title"`
	BookAuthor string    `json:"book_author"`
	OrderDate  time.Time `json:"order_date"`
	Status     string    `json:"status"`
	Username   string    `json:"username"`
}

type Book struct {
	ID     string `json:"id"`
	Title  string `json:"title"`
	Author string `json:"author"`
}

type Claims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// In-memory order storage (in production, this would be in a database)
var orderHistory []OrderHistory

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

func getOrderHistory(c *gin.Context) {
	username := c.GetString("username")

	var userOrders []OrderHistory
	for _, order := range orderHistory {
		if order.Username == username {
			userOrders = append(userOrders, order)
		}
	}

	c.JSON(200, userOrders)
}

func getAllOrders(c *gin.Context) {
	c.JSON(200, orderHistory)
}

func placeOrder(c *gin.Context) {
	username := c.GetString("username")

	var o Order
	if err := c.ShouldBindJSON(&o); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}

	bookServiceURL := fmt.Sprintf("%s/books/%s", os.Getenv("BOOK_SERVICE_URL"), o.BookID)
	log.Printf("Attempting to fetch book from: %s", bookServiceURL)
	resp, err := http.Get(bookServiceURL)
	if err != nil {
		log.Printf("Error fetching book: %v", err)
		c.JSON(500, gin.H{"error": "Failed to fetch book"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Book service returned status code: %d", resp.StatusCode)
		c.JSON(resp.StatusCode, gin.H{"error": "Book not found"})
		return
	}

	var book Book
	json.NewDecoder(resp.Body).Decode(&book)

	// Create order history entry
	orderID := fmt.Sprintf("ord_%d", time.Now().Unix())
	newOrder := OrderHistory{
		ID:         orderID,
		BookID:     book.ID,
		BookTitle:  book.Title,
		BookAuthor: book.Author,
		OrderDate:  time.Now(),
		Status:     "completed",
		Username:   username,
	}
	orderHistory = append(orderHistory, newOrder)

	// Publish message to RabbitMQ
	conn, err := amqp.Dial("amqp://guest:guest@rabbitmq:5672/")
	if err != nil {
		log.Printf("Failed to connect to RabbitMQ: %v", err)
		c.JSON(500, gin.H{"error": "Failed to connect to message broker"})
		return
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Printf("Failed to open a channel: %v", err)
		c.JSON(500, gin.H{"error": "Failed to open message channel"})
		return
	}
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"order_events", // name
		true,           // durable
		false,          // delete when unused
		false,          // exclusive
		false,          // no-wait
		nil,            // arguments
	)
	if err != nil {
		log.Printf("Failed to declare a queue: %v", err)
		c.JSON(500, gin.H{"error": "Failed to declare message queue"})
		return
	}

	orderEvent := map[string]interface{}{
		"order_id":  orderID,
		"book_id":   book.ID,
		"title":     book.Title,
		"author":    book.Author,
		"username":  username,
		"timestamp": time.Now(),
		"message":   fmt.Sprintf("Order %s placed for book: %s by %s", orderID, book.Title, book.Author),
	}
	body, _ := json.Marshal(orderEvent)

	err = ch.Publish(
		"",     // exchange
		q.Name, // routing key
		false,  // mandatory
		false,  // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		})
	if err != nil {
		log.Printf("Failed to publish a message: %v", err)
		c.JSON(500, gin.H{"error": "Failed to publish message"})
		return
	}

	log.Printf(" [x] Sent %s", body)
	c.JSON(200, gin.H{
		"message":  fmt.Sprintf("Order placed for book: %s by %s", book.Title, book.Author),
		"order_id": orderID,
		"order":    newOrder,
	})
}

func main() {
	r := gin.Default()

	// Apply JWT middleware to protected routes
	protected := r.Group("/")
	protected.Use(verifyJWT())
	{
		protected.POST("/order", placeOrder)
		protected.GET("/orders", getOrderHistory)
		protected.GET("/orders/all", getAllOrders)
	}

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	log.Println("Order Service on :8081")
	r.Run(":8081")
}
