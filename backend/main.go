package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
)

func main() {
	// Load .env file if it exists (useful for local dev without docker)
	_ = godotenv.Load()

	// Initialize Gin
	r := gin.Default()

	// Setup Postgres
	dbURL := os.Getenv("DATABASE_URL")
	var dbPool *pgxpool.Pool
	if dbURL != "" {
		var err error
		dbPool, err = pgxpool.New(context.Background(), dbURL)
		if err != nil {
			log.Fatalf("Unable to connect to database: %v\n", err)
		}
		defer dbPool.Close()
		log.Println("Connected to Postgres")
	} else {
		log.Println("DATABASE_URL not set, skipping Postgres connection")
	}

	// Setup Redis
	redisURL := os.Getenv("REDIS_URL")
	var rdb *redis.Client
	if redisURL != "" {
		opts, err := redis.ParseURL(redisURL)
		if err != nil {
			log.Fatalf("Unable to parse Redis URL: %v\n", err)
		}
		rdb = redis.NewClient(opts)
		if err := rdb.Ping(context.Background()).Err(); err != nil {
			log.Fatalf("Unable to connect to Redis: %v\n", err)
		}
		log.Println("Connected to Redis")
	} else {
		log.Println("REDIS_URL not set, skipping Redis connection")
	}

	// Basic Health Check Route
	r.GET("/api/health", func(c *gin.Context) {
		dbStatus := "disconnected"
		if dbPool != nil {
			err := dbPool.Ping(context.Background())
			if err == nil {
				dbStatus = "connected"
			}
		}

		redisStatus := "disconnected"
		if rdb != nil {
			err := rdb.Ping(context.Background()).Err()
			if err == nil {
				redisStatus = "connected"
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"status":   "ok",
			"postgres": dbStatus,
			"redis":    redisStatus,
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	fmt.Printf("Starting server on port %s...\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
