package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
)

// Data Models
type User struct {
	ID    string   `json:"id"`
	Name  string   `json:"name"`
	Email string   `json:"email"`
	Role  string   `json:"role"` // client or freelancer
	Tags  []string `json:"tags,omitempty"`
}

type Job struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Budget      float64   `json:"budget"`
	Tags        []string  `json:"tags"`
	AuthorID    string    `json:"authorId"`
	Status      string    `json:"status"` // open, in_progress, completed
	CreatedAt   time.Time `json:"createdAt"`
}

type Offer struct {
	ID           string  `json:"id"`
	JobID        string  `json:"jobId"`
	FreelancerID string  `json:"freelancerId"`
	Amount       float64 `json:"amount"`
	Message      string  `json:"message"`
	Status       string  `json:"status"` // pending, accepted, rejected
}

type Message struct {
	ID        string    `json:"id"`
	OfferID   string    `json:"offerId"`
	SenderID  string    `json:"senderId"`
	Text      string    `json:"text"`
	CreatedAt time.Time `json:"createdAt"`
}

func main() {
	_ = godotenv.Load()

	// 1. Initialize Gin
	r := gin.Default()

	// 2. Setup Postgres
	dbURL := os.Getenv("DATABASE_URL")
	dbPool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer dbPool.Close()

	// Run simple migrations (create tables if not exist)
	initDB(dbPool)

	// 3. Setup Redis
	redisURL := os.Getenv("REDIS_URL")
	opts, _ := redis.ParseURL(redisURL)
	rdb := redis.NewClient(opts)
	log.Println("Connected to Redis and Postgres")

	// 4. Routes
	api := r.Group("/api")
	{
		api.GET("/health", func(c *gin.Context) {
			redisStatus := "connected"
			if err := rdb.Ping(context.Background()).Err(); err != nil {
				redisStatus = "disconnected"
			}
			c.JSON(http.StatusOK, gin.H{
				"status": "ok",
				"db":     "connected",
				"redis":  redisStatus,
			})
		})

		// TODO: Add actual CRUD endpoints for Users, Jobs, Offers, and Messages
		// For now, keeping it lean to ensure the binary build is successful
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}

func initDB(pool *pgxpool.Pool) {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			email TEXT UNIQUE NOT NULL,
			role TEXT NOT NULL,
			tags TEXT[]
		)`,
		`CREATE TABLE IF NOT EXISTS jobs (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			description TEXT NOT NULL,
			budget NUMERIC NOT NULL,
			tags TEXT[],
			author_id TEXT NOT NULL,
			status TEXT NOT NULL,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS offers (
			id TEXT PRIMARY KEY,
			job_id TEXT NOT NULL,
			freelancer_id TEXT NOT NULL,
			amount NUMERIC NOT NULL,
			message TEXT NOT NULL,
			status TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS messages (
			id TEXT PRIMARY KEY,
			offer_id TEXT NOT NULL,
			sender_id TEXT NOT NULL,
			text TEXT NOT NULL,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		)`,
	}

	for _, q := range queries {
		_, err := pool.Exec(context.Background(), q)
		if err != nil {
			log.Printf("Migration error: %v", err)
		}
	}
}
