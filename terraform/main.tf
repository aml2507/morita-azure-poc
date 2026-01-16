# =============================================================================
# Morita Azure POC - Main Configuration
# =============================================================================
# This is the main Terraform configuration that orchestrates all modules
# to create the complete infrastructure for the Morita POC.
#
# Architecture:
# [User] -> [App Service + VNet Integration] -> [Private Endpoint] -> [Azure OpenAI]
#                                                       |
#                                               [Private DNS Zone]
# =============================================================================

# -----------------------------------------------------------------------------
# Local Variables
# -----------------------------------------------------------------------------
locals {
  # Standard tags applied to all resources
  common_tags = merge(
    {
      Project     = "Morita"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Purpose     = "Allianz-Interview"
    },
    var.tags
  )

  # Resource naming
  resource_group_name = "rg-${var.project_name}-${var.environment}"
}

# -----------------------------------------------------------------------------
# Random Suffix for Globally Unique Names
# -----------------------------------------------------------------------------
resource "random_string" "suffix" {
  length  = 6
  lower   = true
  upper   = false
  numeric = true
  special = false
}

# -----------------------------------------------------------------------------
# Data Sources
# -----------------------------------------------------------------------------
data "azurerm_subscription" "current" {}

data "azurerm_client_config" "current" {}

# -----------------------------------------------------------------------------
# Resource Group
# -----------------------------------------------------------------------------
resource "azurerm_resource_group" "main" {
  name     = local.resource_group_name
  location = var.location

  tags = local.common_tags
}

# -----------------------------------------------------------------------------
# Network Module
# -----------------------------------------------------------------------------
# Creates VNet with two subnets:
# - app-subnet: For App Service VNet Integration
# - pe-subnet: For Private Endpoints
module "network" {
  source = "./modules/network"

  project_name        = var.project_name
  environment         = var.environment
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name

  address_space     = var.vnet_address_space
  app_subnet_prefix = var.app_subnet_prefix
  pe_subnet_prefix  = var.pe_subnet_prefix

  tags = local.common_tags
}

# -----------------------------------------------------------------------------
# Monitoring Module
# -----------------------------------------------------------------------------
# Creates Application Insights and Budget alerts
# Must be created before App Service to provide connection string
module "monitoring" {
  source = "./modules/monitoring"

  project_name        = var.project_name
  environment         = var.environment
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
  resource_group_id   = azurerm_resource_group.main.id
  random_suffix       = random_string.suffix.result

  admin_email            = var.admin_email
  budget_amount          = var.budget_amount
  budget_alert_threshold = var.budget_alert_threshold

  tags = local.common_tags
}

# -----------------------------------------------------------------------------
# Azure OpenAI Module
# -----------------------------------------------------------------------------
# Creates Azure OpenAI with:
# - Public access DISABLED
# - Private Endpoint in pe-subnet
# - Private DNS Zone for name resolution
module "openai" {
  source = "./modules/openai"

  project_name        = var.project_name
  environment         = var.environment
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
  random_suffix       = random_string.suffix.result

  sku                   = var.openai_sku
  model_deployment_name = var.openai_model_name
  model_name            = var.openai_model_name
  model_version         = var.openai_model_version
  model_capacity        = var.openai_model_capacity

  vnet_id      = module.network.vnet_id
  pe_subnet_id = module.network.pe_subnet_id

  tags = local.common_tags

  depends_on = [module.network]
}

# -----------------------------------------------------------------------------
# App Service Module
# -----------------------------------------------------------------------------
# Creates App Service with:
# - System-assigned Managed Identity
# - VNet Integration with app-subnet
# - RBAC assignment for OpenAI access
module "app_service" {
  source = "./modules/app-service"

  project_name        = var.project_name
  environment         = var.environment
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
  random_suffix       = random_string.suffix.result

  sku          = var.app_service_sku
  node_version = var.node_version

  app_subnet_id = module.network.app_subnet_id

  openai_endpoint        = module.openai.openai_endpoint
  openai_deployment_name = module.openai.deployment_name
  openai_id              = module.openai.openai_id

  app_insights_connection_string = module.monitoring.application_insights_connection_string

  tags = local.common_tags

  depends_on = [
    module.network,
    module.openai,
    module.monitoring
  ]
}
