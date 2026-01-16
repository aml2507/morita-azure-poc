# =============================================================================
# Azure OpenAI Module
# =============================================================================
# This module creates:
# - Azure OpenAI Cognitive Service (with public access DISABLED)
# - GPT-4 Model Deployment
# - Private Endpoint for secure access
# - Private DNS Zone for name resolution
# - Virtual Network Link
# =============================================================================

# -----------------------------------------------------------------------------
# Azure OpenAI Service
# -----------------------------------------------------------------------------
resource "azurerm_cognitive_account" "openai" {
  name                = "${var.project_name}-openai-${var.random_suffix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  kind                = "OpenAI"
  sku_name            = var.sku

  # CRITICAL: Disable public network access for security
  # Access will only be allowed through Private Endpoint
  public_network_access_enabled = false

  # Custom subdomain required for Private Endpoint
  custom_subdomain_name = "${var.project_name}-openai-${var.random_suffix}"

  # Network ACLs - default deny
  network_acls {
    default_action = "Deny"
  }

  identity {
    type = "SystemAssigned"
  }

  tags = var.tags

  lifecycle {
    ignore_changes = [
      # Ignore changes to tags that might be added by Azure
      tags["hidden-link"]
    ]
  }
}

# -----------------------------------------------------------------------------
# GPT-4 Model Deployment
# -----------------------------------------------------------------------------
resource "azurerm_cognitive_deployment" "gpt4" {
  name                 = var.model_deployment_name
  cognitive_account_id = azurerm_cognitive_account.openai.id

  model {
    format  = "OpenAI"
    name    = var.model_name
    version = var.model_version
  }

  sku {
    name     = "Standard"
    capacity = var.model_capacity
  }
}

# -----------------------------------------------------------------------------
# Private DNS Zone for Azure OpenAI
# -----------------------------------------------------------------------------
resource "azurerm_private_dns_zone" "openai" {
  name                = "privatelink.openai.azure.com"
  resource_group_name = var.resource_group_name

  tags = var.tags
}

# -----------------------------------------------------------------------------
# Virtual Network Link for DNS Resolution
# -----------------------------------------------------------------------------
resource "azurerm_private_dns_zone_virtual_network_link" "openai" {
  name                  = "link-${var.project_name}-openai"
  resource_group_name   = var.resource_group_name
  private_dns_zone_name = azurerm_private_dns_zone.openai.name
  virtual_network_id    = var.vnet_id
  registration_enabled  = false

  tags = var.tags
}

# -----------------------------------------------------------------------------
# Private Endpoint for Azure OpenAI
# -----------------------------------------------------------------------------
resource "azurerm_private_endpoint" "openai" {
  name                = "pe-${var.project_name}-openai"
  location            = var.location
  resource_group_name = var.resource_group_name
  subnet_id           = var.pe_subnet_id

  private_service_connection {
    name                           = "psc-${var.project_name}-openai"
    private_connection_resource_id = azurerm_cognitive_account.openai.id
    is_manual_connection           = false
    subresource_names              = ["account"]
  }

  private_dns_zone_group {
    name                 = "dns-zone-group-openai"
    private_dns_zone_ids = [azurerm_private_dns_zone.openai.id]
  }

  tags = var.tags

  depends_on = [
    azurerm_private_dns_zone_virtual_network_link.openai
  ]
}
