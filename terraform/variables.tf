# =============================================================================
# Variables for Morita Azure POC
# =============================================================================

# -----------------------------------------------------------------------------
# General Configuration
# -----------------------------------------------------------------------------
variable "project_name" {
  description = "Project name used for naming resources"
  type        = string
  default     = "morita"

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "Project name must contain only lowercase letters, numbers, and hyphens."
  }
}

variable "environment" {
  description = "Environment name (poc, dev, staging, prod)"
  type        = string
  default     = "poc"

  validation {
    condition     = contains(["poc", "dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: poc, dev, staging, prod."
  }
}

variable "location" {
  description = "Azure region for all resources"
  type        = string
  default     = "westeurope"
}

# -----------------------------------------------------------------------------
# Networking Configuration
# -----------------------------------------------------------------------------
variable "vnet_address_space" {
  description = "Address space for the Virtual Network"
  type        = list(string)
  default     = ["10.0.0.0/16"]
}

variable "app_subnet_prefix" {
  description = "Address prefix for the App Service subnet (VNet Integration)"
  type        = list(string)
  default     = ["10.0.1.0/24"]
}

variable "pe_subnet_prefix" {
  description = "Address prefix for the Private Endpoints subnet"
  type        = list(string)
  default     = ["10.0.2.0/24"]
}

# -----------------------------------------------------------------------------
# Azure OpenAI Configuration
# -----------------------------------------------------------------------------
variable "openai_sku" {
  description = "SKU for Azure OpenAI service"
  type        = string
  default     = "S0"
}

variable "openai_model_name" {
  description = "Name of the OpenAI model to deploy"
  type        = string
  default     = "gpt-4"
}

variable "openai_model_version" {
  description = "Version of the OpenAI model"
  type        = string
  default     = "0613"
}

variable "openai_model_capacity" {
  description = "Capacity in TPM (tokens per minute) for the model deployment"
  type        = number
  default     = 10
}

# -----------------------------------------------------------------------------
# App Service Configuration
# -----------------------------------------------------------------------------
variable "app_service_sku" {
  description = "SKU for App Service Plan"
  type        = string
  default     = "B1"
}

variable "node_version" {
  description = "Node.js version for the App Service"
  type        = string
  default     = "20-lts"
}

# -----------------------------------------------------------------------------
# Monitoring & Budget Configuration
# -----------------------------------------------------------------------------
variable "admin_email" {
  description = "Email address for budget alerts and notifications"
  type        = string
  sensitive   = true

  validation {
    condition     = can(regex("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", var.admin_email))
    error_message = "Must be a valid email address."
  }
}

variable "budget_amount" {
  description = "Monthly budget amount in EUR"
  type        = number
  default     = 10

  validation {
    condition     = var.budget_amount > 0
    error_message = "Budget amount must be greater than 0."
  }
}

variable "budget_alert_threshold" {
  description = "Percentage threshold for budget alerts (0-100)"
  type        = number
  default     = 80

  validation {
    condition     = var.budget_alert_threshold > 0 && var.budget_alert_threshold <= 100
    error_message = "Budget alert threshold must be between 1 and 100."
  }
}

# -----------------------------------------------------------------------------
# Tags
# -----------------------------------------------------------------------------
variable "tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}
