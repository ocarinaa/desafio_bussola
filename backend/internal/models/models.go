package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Email     string         `gorm:"uniqueIndex;not null" json:"email"`
	Password  string         `gorm:"not null" json:"-"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Jobs      []Job          `gorm:"foreignKey:CreatedBy" json:"jobs"`
	Applications []Application `gorm:"foreignKey:UserID" json:"applications"`
}

type Job struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Title       string         `gorm:"not null" json:"title"`
	Description string         `gorm:"type:text;not null" json:"description"`
	Company     string         `gorm:"not null" json:"company"`
	Location    string         `json:"location"`
	Salary      float64        `json:"salary"`
	CreatedBy   uint           `gorm:"not null" json:"created_by"`
	Creator     User           `gorm:"foreignKey:CreatedBy" json:"creator"`
	Applications []Application `gorm:"foreignKey:JobID" json:"applications"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type Application struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    uint           `gorm:"not null;uniqueIndex:job_user" json:"user_id"`
	User      User           `gorm:"foreignKey:UserID" json:"user"`
	JobID     uint           `gorm:"not null;uniqueIndex:job_user" json:"job_id"`
	Job       Job            `gorm:"foreignKey:JobID" json:"job"`
	Status    string         `gorm:"default:'pending'" json:"status"`
	Message   string         `gorm:"type:text" json:"message"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type RegisterInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type CreateJobInput struct {
	Title       string  `json:"title" binding:"required"`
	Description string  `json:"description" binding:"required"`
	Company     string  `json:"company" binding:"required"`
	Location    string  `json:"location"`
	Salary      float64 `json:"salary"`
}

type CreateApplicationInput struct {
	Message string `json:"message"`
}
