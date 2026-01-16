# =============================================================================
# Network Module Outputs
# =============================================================================

output "vnet_id" {
  description = "ID of the Virtual Network"
  value       = azurerm_virtual_network.main.id
}

output "vnet_name" {
  description = "Name of the Virtual Network"
  value       = azurerm_virtual_network.main.name
}

output "app_subnet_id" {
  description = "ID of the App Service subnet"
  value       = azurerm_subnet.app.id
}

output "app_subnet_name" {
  description = "Name of the App Service subnet"
  value       = azurerm_subnet.app.name
}

output "pe_subnet_id" {
  description = "ID of the Private Endpoints subnet"
  value       = azurerm_subnet.private_endpoints.id
}

output "pe_subnet_name" {
  description = "Name of the Private Endpoints subnet"
  value       = azurerm_subnet.private_endpoints.name
}
