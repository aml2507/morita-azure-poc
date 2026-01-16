variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = "rg-morita-poc"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "eastus"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name used for naming resources"
  type        = string
  default     = "morita"
}
