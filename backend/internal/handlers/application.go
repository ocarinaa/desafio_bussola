package handlers

import (
	"net/http"
	"strconv"

	"test-prog-backend/internal/database"
	"test-prog-backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ApplicationHandler struct{}

func NewApplicationHandler() *ApplicationHandler {
	return &ApplicationHandler{}
}

func (h *ApplicationHandler) CreateApplication(c *gin.Context) {
	jobID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid job id"})
		return
	}

	userID, _ := c.Get("userID")

	var input models.CreateApplicationInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := database.GetDB()

	// Check if job exists
	var job models.Job
	if err := db.First(&job, uint(jobID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "job not found"})
		return
	}

	// Check if already applied
	var existing models.Application
	if err := db.Where("user_id = ? AND job_id = ?", userID, uint(jobID)).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "you already applied to this job"})
		return
	}

	application := models.Application{
		UserID:  userID.(uint),
		JobID:   uint(jobID),
		Status:  "pending",
		Message: input.Message,
	}

	if err := db.Create(&application).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create application"})
		return
	}

	db.Preload("User").Preload("Job").First(&application, application.ID)
	c.JSON(http.StatusCreated, application)
}

func (h *ApplicationHandler) GetMyApplications(c *gin.Context) {
	userID, _ := c.Get("userID")

	db := database.GetDB()
	var applications []models.Application
	if err := db.Where("user_id = ?", userID).Preload("Job").Find(&applications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch applications"})
		return
	}

	c.JSON(http.StatusOK, applications)
}

func (h *ApplicationHandler) GetJobApplications(c *gin.Context) {
	jobID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid job id"})
		return
	}

	userID, _ := c.Get("userID")

	db := database.GetDB()

	// Check if user owns this job
	var job models.Job
	if err := db.First(&job, uint(jobID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "job not found"})
		return
	}

	if job.CreatedBy != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "not authorized"})
		return
	}

	var applications []models.Application
	if err := db.Where("job_id = ?", uint(jobID)).Preload("User").Find(&applications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch applications"})
		return
	}

	c.JSON(http.StatusOK, applications)
}

func (h *ApplicationHandler) UpdateApplicationStatus(c *gin.Context) {
	appID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid application id"})
		return
	}

	type StatusInput struct {
		Status string `json:"status" binding:"required"`
	}

	var input StatusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("userID")

	db := database.GetDB()

	// Get application and check authorization
	var application models.Application
	if err := db.Preload("Job").First(&application, uint(appID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "application not found"})
		return
	}

	if application.Job.CreatedBy != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "not authorized"})
		return
	}

	application.Status = input.Status
	if err := db.Save(&application).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update application"})
		return
	}

	db.Preload("User").Preload("Job").First(&application, application.ID)
	c.JSON(http.StatusOK, application)
}
