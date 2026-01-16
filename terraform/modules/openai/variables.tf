# =============================================================================
# Azure OpenAI Module Variables
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
  description = "SKU for Azure OpenAI service"
  type        = string
  default     = "S0"
}

variable "model_deployment_name" {
  description = "Name for the model deployment"
  type        = string
  default     = "gpt-4"
}

variable "model_name" {
  description = "Name of the OpenAI model"
  type        = string
  default     = "gpt-4"
}

variable "model_version" {
  description = "Version of the OpenAI model"
  type        = string
  default     = "0613"
}

variable "model_capacity" {
  description = "Capacity in TPM (tokens per minute)"
  type        = number
  default     = 10
}

variable "vnet_id" {
  description = "ID of the Virtual Network for DNS link"
  type        = string
}

variable "pe_subnet_id" {
  description = "ID of the subnet for Private Endpoint"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
