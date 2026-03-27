package main

import (
	"log"
	"os"

	"test-prog-backend/internal/database"
	"test-prog-backend/internal/handlers"
	"test-prog-backend/internal/middleware"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	if err := database.Connect(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	r := gin.Default()
	r.Use(CORSMiddleware())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	authHandler := handlers.NewAuthHandler()
	jobHandler := handlers.NewJobHandler()
	appHandler := handlers.NewApplicationHandler()

	api := r.Group("/api")
	{
		api.POST("/register", authHandler.Register)
		api.POST("/login", authHandler.Login)

		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/me", authHandler.GetMe)

			protected.POST("/jobs", jobHandler.CreateJob)
			protected.GET("/jobs", jobHandler.GetJobs)
			protected.GET("/jobs/my", jobHandler.GetMyJobs)
			protected.GET("/jobs/:id", jobHandler.GetJobByID)
			protected.PUT("/jobs/:id", jobHandler.UpdateJob)
			protected.DELETE("/jobs/:id", jobHandler.DeleteJob)

			protected.POST("/jobs/:id/apply", appHandler.CreateApplication)
			protected.GET("/applications", appHandler.GetMyApplications)
			protected.GET("/jobs/:id/applications", appHandler.GetJobApplications)
			protected.PUT("/applications/:id", appHandler.UpdateApplicationStatus)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
