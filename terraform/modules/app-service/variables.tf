# =============================================================================
# App Service Module Variables
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

variable "random_suffix" {
  description = "Random suffix for globally unique names"
  type        = string
}

variable "sku" {
  description = "SKU for App Service Plan (e.g., B1, B2, S1)"
  type        = string
  default     = "B1"
}

variable "node_version" {
  description = "Node.js version"
  type        = string
  default     = "20-lts"
}

variable "app_subnet_id" {
  description = "ID of the subnet for VNet Integration"
  type        = string
}

variable "openai_endpoint" {
  description = "Endpoint URL of Azure OpenAI service"
  type        = string
}

variable "openai_deployment_name" {
  description = "Name of the OpenAI model deployment"
  type        = string
}

variable "openai_id" {
  description = "ID of the Azure OpenAI service for RBAC"
  type        = string
}

variable "app_insights_connection_string" {
  description = "Application Insights connection string"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
