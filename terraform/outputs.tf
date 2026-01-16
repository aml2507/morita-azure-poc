# =============================================================================
# Outputs for Morita Azure POC
# =============================================================================
# These outputs provide important information about the deployed infrastructure
# that can be used for application configuration and verification.
# =============================================================================

# -----------------------------------------------------------------------------
# Resource Group
# -----------------------------------------------------------------------------
output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "resource_group_location" {
  description = "Location of the resource group"
  value       = azurerm_resource_group.main.location
}

output "resource_group_id" {
  description = "ID of the resource group"
  value       = azurerm_resource_group.main.id
}

# -----------------------------------------------------------------------------
# Network
# -----------------------------------------------------------------------------
output "vnet_id" {
  description = "ID of the Virtual Network"
  value       = module.network.vnet_id
}

output "vnet_name" {
  description = "Name of the Virtual Network"
  value       = module.network.vnet_name
}

output "app_subnet_id" {
  description = "ID of the App Service subnet"
  value       = module.network.app_subnet_id
}

output "pe_subnet_id" {
  description = "ID of the Private Endpoints subnet"
  value       = module.network.pe_subnet_id
}

# -----------------------------------------------------------------------------
# Azure OpenAI
# -----------------------------------------------------------------------------
output "openai_endpoint" {
  description = "Endpoint URL for Azure OpenAI service"
  value       = module.openai.openai_endpoint
}

output "openai_deployment_name" {
  description = "Name of the GPT-4 model deployment"
  value       = module.openai.deployment_name
}

output "openai_name" {
  description = "Name of the Azure OpenAI service"
  value       = module.openai.openai_name
}

output "private_endpoint_ip" {
  description = "Private IP address of the OpenAI Private Endpoint"
  value       = module.openai.private_endpoint_ip
}

# -----------------------------------------------------------------------------
# App Service
# -----------------------------------------------------------------------------
output "app_service_url" {
  description = "URL of the App Service"
  value       = module.app_service.app_service_url
}

output "app_service_default_hostname" {
  description = "Default hostname of the App Service"
  value       = module.app_service.default_hostname
}

output "app_service_name" {
  description = "Name of the App Service"
  value       = module.app_service.app_service_name
}

output "managed_identity_principal_id" {
  description = "Principal ID of the App Service Managed Identity"
  value       = module.app_service.managed_identity_principal_id
}

# -----------------------------------------------------------------------------
# Monitoring
# -----------------------------------------------------------------------------
output "application_insights_instrumentation_key" {
  description = "Instrumentation key for Application Insights"
  value       = module.monitoring.application_insights_instrumentation_key
  sensitive   = true
}

output "application_insights_connection_string" {
  description = "Connection string for Application Insights"
  value       = module.monitoring.application_insights_connection_string
  sensitive   = true
}

output "application_insights_name" {
  description = "Name of Application Insights"
  value       = module.monitoring.application_insights_name
}

output "log_analytics_workspace_id" {
  description = "ID of the Log Analytics Workspace"
  value       = module.monitoring.log_analytics_workspace_id
}

# -----------------------------------------------------------------------------
# Subscription Info
# -----------------------------------------------------------------------------
output "subscription_id" {
  description = "Azure Subscription ID"
  value       = data.azurerm_subscription.current.subscription_id
}

output "tenant_id" {
  description = "Azure Tenant ID"
  value       = data.azurerm_client_config.current.tenant_id
}

# -----------------------------------------------------------------------------
# Summary (for quick reference)
# -----------------------------------------------------------------------------
output "deployment_summary" {
  description = "Summary of deployed resources"
  value = {
    resource_group = azurerm_resource_group.main.name
    location       = azurerm_resource_group.main.location
    app_url        = module.app_service.app_service_url
    openai_endpoint = module.openai.openai_endpoint
    deployment      = module.openai.deployment_name
  }
}
