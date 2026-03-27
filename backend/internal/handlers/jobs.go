package handlers

import (
	"net/http"
	"strconv"

	"test-prog-backend/internal/database"
	"test-prog-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type JobHandler struct{}

func NewJobHandler() *JobHandler {
	return &JobHandler{}
}

func (h *JobHandler) CreateJob(c *gin.Context) {
	var input models.CreateJobInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("userID")

	job := models.Job{
		Title:       input.Title,
		Description: input.Description,
		Company:     input.Company,
		Location:    input.Location,
		Salary:      input.Salary,
		CreatedBy:   userID.(uint),
	}

	db := database.GetDB()
	if err := db.Create(&job).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create job"})
		return
	}

	db.Preload("Creator").First(&job, job.ID)
	c.JSON(http.StatusCreated, job)
}

func (h *JobHandler) GetJobs(c *gin.Context) {
	db := database.GetDB()

	query := db.Preload("Creator").Model(&models.Job{})

	if title := c.Query("title"); title != "" {
		query = query.Where("title ILIKE ?", "%"+title+"%")
	}

	if company := c.Query("company"); company != "" {
		query = query.Where("company ILIKE ?", "%"+company+"%")
	}

	if location := c.Query("location"); location != "" {
		query = query.Where("location ILIKE ?", "%"+location+"%")
	}

	var jobs []models.Job
	if err := query.Find(&jobs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch jobs"})
		return
	}

	c.JSON(http.StatusOK, jobs)
}

func (h *JobHandler) GetJobByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid job id"})
		return
	}

	db := database.GetDB()
	var job models.Job
	if err := db.Preload("Creator").Preload("Applications").First(&job, uint(id)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "job not found"})
		return
	}

	c.JSON(http.StatusOK, job)
}

func (h *JobHandler) UpdateJob(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid job id"})
		return
	}

	userID, _ := c.Get("userID")

	db := database.GetDB()
	var job models.Job
	if err := db.First(&job, uint(id)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "job not found"})
		return
	}

	if job.CreatedBy != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "not authorized to update this job"})
		return
	}

	var input models.CreateJobInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	job.Title = input.Title
	job.Description = input.Description
	job.Company = input.Company
	job.Location = input.Location
	job.Salary = input.Salary

	if err := db.Save(&job).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update job"})
		return
	}

	c.JSON(http.StatusOK, job)
}

func (h *JobHandler) DeleteJob(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid job id"})
		return
	}

	userID, _ := c.Get("userID")

	db := database.GetDB()
	var job models.Job
	if err := db.First(&job, uint(id)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "job not found"})
		return
	}

	if job.CreatedBy != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "not authorized to delete this job"})
		return
	}

	if err := db.Delete(&job).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete job"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "job deleted successfully"})
}

func (h *JobHandler) GetMyJobs(c *gin.Context) {
	userID, _ := c.Get("userID")

	db := database.GetDB()
	var jobs []models.Job
	if err := db.Where("created_by = ?", userID).Find(&jobs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch jobs"})
		return
	}

	c.JSON(http.StatusOK, jobs)
}
