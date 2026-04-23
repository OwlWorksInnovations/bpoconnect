package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
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

	// CORS Middleware (Important for separate Frontend/Backend)
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, UPDATE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// 2. Setup Postgres
	dbURL := os.Getenv("DATABASE_URL")
	dbPool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer dbPool.Close()
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
			c.JSON(http.StatusOK, gin.H{"status": "ok", "db": "connected", "redis": redisStatus})
		})

		// Users
		api.POST("/users/register", func(c *gin.Context) {
			var u User
			if err := c.ShouldBindJSON(&u); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			u.ID = uuid.New().String()
			_, err := dbPool.Exec(context.Background(), 
				"INSERT INTO users (id, name, email, role, tags) VALUES ($1, $2, $3, $4, $5)",
				u.ID, u.Name, u.Email, u.Role, u.Tags)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "User already exists or database error"})
				return
			}
			c.JSON(http.StatusOK, u)
		})

		api.POST("/users/login", func(c *gin.Context) {
			var creds struct { Email string `json:"email"` }
			if err := c.ShouldBindJSON(&creds); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			var u User
			err := dbPool.QueryRow(context.Background(), 
				"SELECT id, name, email, role, tags FROM users WHERE email = $1", 
				creds.Email).Scan(&u.ID, &u.Name, &u.Email, &u.Role, &u.Tags)
			if err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
				return
			}
			c.JSON(http.StatusOK, u)
		})

		// Jobs
		api.GET("/jobs", func(c *gin.Context) {
			rows, _ := dbPool.Query(context.Background(), "SELECT id, title, description, budget, tags, author_id, status FROM jobs WHERE status = 'open'")
			jobs := []Job{}
			for rows.Next() {
				var j Job
				rows.Scan(&j.ID, &j.Title, &j.Description, &j.Budget, &j.Tags, &j.AuthorID, &j.Status)
				jobs = append(jobs, j)
			}
			c.JSON(http.StatusOK, jobs)
		})

		api.POST("/jobs", func(c *gin.Context) {
			var j Job
			if err := c.ShouldBindJSON(&j); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			j.ID = uuid.New().String()
			j.Status = "open"
			_, err := dbPool.Exec(context.Background(), 
				"INSERT INTO jobs (id, title, description, budget, tags, author_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7)",
				j.ID, j.Title, j.Description, j.Budget, j.Tags, j.AuthorID, j.Status)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, j)
		})

		// Offers
		api.POST("/offers", func(c *gin.Context) {
			var o Offer
			if err := c.ShouldBindJSON(&o); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			o.ID = uuid.New().String()
			o.Status = "pending"
			_, err := dbPool.Exec(context.Background(), 
				"INSERT INTO offers (id, job_id, freelancer_id, amount, message, status) VALUES ($1, $2, $3, $4, $5, $6)",
				o.ID, o.JobID, o.FreelancerID, o.Amount, o.Message, o.Status)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			// Automatic first message
			msgID := uuid.New().String()
			dbPool.Exec(context.Background(), 
				"INSERT INTO messages (id, offer_id, sender_id, text) VALUES ($1, $2, $3, $4)",
				msgID, o.ID, o.FreelancerID, o.Message)
				
			c.JSON(http.StatusOK, o)
		})

		api.GET("/offers", func(c *gin.Context) {
			jobID := c.Query("jobId")
			rows, _ := dbPool.Query(context.Background(), "SELECT id, job_id, freelancer_id, amount, message, status FROM offers WHERE job_id = $1", jobID)
			offers := []Offer{}
			for rows.Next() {
				var o Offer
				rows.Scan(&o.ID, &o.JobID, &o.FreelancerID, &o.Amount, &o.Message, &o.Status)
				offers = append(offers, o)
			}
			c.JSON(http.StatusOK, offers)
		})

		api.POST("/offers/accept", func(c *gin.Context) {
			var body struct { OfferID string `json:"offerId"` }
			if err := c.ShouldBindJSON(&body); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			
			// Start a transaction
			tx, err := dbPool.Begin(context.Background())
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			defer tx.Rollback(context.Background())

			// 1. Get Job ID for this offer
			var jobID string
			err = tx.QueryRow(context.Background(), "SELECT job_id FROM offers WHERE id = $1", body.OfferID).Scan(&jobID)
			if err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Offer not found"})
				return
			}

			// 2. Accept this offer
			_, err = tx.Exec(context.Background(), "UPDATE offers SET status = 'accepted' WHERE id = $1", body.OfferID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			// 3. Reject other offers for same job
			_, err = tx.Exec(context.Background(), "UPDATE offers SET status = 'rejected' WHERE job_id = $1 AND id != $2", jobID, body.OfferID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			// 4. Set job to in_progress
			_, err = tx.Exec(context.Background(), "UPDATE jobs SET status = 'in_progress' WHERE id = $1", jobID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			tx.Commit(context.Background())
			c.JSON(http.StatusOK, gin.H{"status": "success"})
		})

		// Messages
		api.GET("/messages", func(c *gin.Context) {
			offerID := c.Query("offerId")
			rows, _ := dbPool.Query(context.Background(), "SELECT id, offer_id, sender_id, text, created_at FROM messages WHERE offer_id = $1 ORDER BY created_at ASC", offerID)
			msgs := []Message{}
			for rows.Next() {
				var m Message
				rows.Scan(&m.ID, &m.OfferID, &m.SenderID, &m.Text, &m.CreatedAt)
				msgs = append(msgs, m)
			}
			c.JSON(http.StatusOK, msgs)
		})

		api.POST("/messages", func(c *gin.Context) {
			var m Message
			if err := c.ShouldBindJSON(&m); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			m.ID = uuid.New().String()
			_, err := dbPool.Exec(context.Background(), 
				"INSERT INTO messages (id, offer_id, sender_id, text) VALUES ($1, $2, $3, $4)",
				m.ID, m.OfferID, m.SenderID, m.Text)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, m)
		})
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
