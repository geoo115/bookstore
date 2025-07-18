package main

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/streadway/amqp"
)

func connectToRabbitMQ() *amqp.Connection {
	var conn *amqp.Connection
	var err error

	for i := 0; i < 30; i++ { // Try for 30 seconds
		conn, err = amqp.Dial("amqp://guest:guest@rabbitmq:5672/")
		if err == nil {
			log.Println("Successfully connected to RabbitMQ")
			return conn
		}
		log.Printf("Failed to connect to RabbitMQ (attempt %d/30): %v", i+1, err)
		time.Sleep(1 * time.Second)
	}
	log.Fatalf("Failed to connect to RabbitMQ after 30 attempts: %v", err)
	return nil
}

func main() {
	conn := connectToRabbitMQ()
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Failed to open a channel: %v", err)
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
		log.Fatalf("Failed to declare a queue: %v", err)
	}

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		true,   // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	if err != nil {
		log.Fatalf("Failed to register a consumer: %v", err)
	}

	forever := make(chan bool)

	go func() {
		for d := range msgs {
			log.Printf("Received a message: %s", d.Body)
			// Here you would process the order event, e.g., send a notification
		}
	}()

	r := gin.Default()
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	log.Println("Notification Service: Waiting for messages. To exit press CTRL+C")
	<-forever
}
