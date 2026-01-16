# =============================================================================
# Network Module - Virtual Network and Subnets
# =============================================================================
# This module creates the networking infrastructure including:
# - Virtual Network
# - App Service Integration Subnet (with delegation)
# - Private Endpoints Subnet
# =============================================================================

# -----------------------------------------------------------------------------
# Virtual Network
# -----------------------------------------------------------------------------
resource "azurerm_virtual_network" "main" {
  name                = "vnet-${var.project_name}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  address_space       = var.address_space

  tags = var.tags
}

# -----------------------------------------------------------------------------
# App Service Subnet (for VNet Integration)
# -----------------------------------------------------------------------------
# This subnet is delegated to Microsoft.Web/serverFarms for App Service
# VNet Integration, allowing the App Service to make outbound calls
# through the VNet.
resource "azurerm_subnet" "app" {
  name                 = "snet-${var.project_name}-app"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = var.app_subnet_prefix

  # Delegation required for App Service VNet Integration
  delegation {
    name = "delegation-app-service"

    service_delegation {
      name = "Microsoft.Web/serverFarms"
      actions = [
        "Microsoft.Network/virtualNetworks/subnets/action"
      ]
    }
  }
}

# -----------------------------------------------------------------------------
# Private Endpoints Subnet
# -----------------------------------------------------------------------------
# This subnet hosts Private Endpoints for Azure services (OpenAI).
# Private endpoint network policies must be disabled for Private Endpoints.
resource "azurerm_subnet" "private_endpoints" {
  name                 = "snet-${var.project_name}-pe"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = var.pe_subnet_prefix

  # Required for Private Endpoints
  private_endpoint_network_policies_enabled = true
}
