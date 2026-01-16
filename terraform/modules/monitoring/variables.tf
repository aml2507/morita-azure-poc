# =============================================================================
# Monitoring Module Variables
# =============================================================================

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "resource_group_id" {
  description = "ID of the resource group (for budget scope)"
  type        = string
}

variable "random_suffix" {
  description = "Random suffix for globally unique names"
  type        = string
}

variable "admin_email" {
  description = "Email address for budget alerts"
  type        = string
  sensitive   = true
}

variable "budget_amount" {
  description = "Monthly budget amount in the subscription currency"
  type        = number
  default     = 10
}

variable "budget_alert_threshold" {
  description = "Percentage threshold for budget alerts (0-100)"
  type        = number
  default     = 80
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
