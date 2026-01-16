# =============================================================================
# Azure OpenAI Module Outputs
# =============================================================================

output "openai_id" {
  description = "ID of the Azure OpenAI service"
  value       = azurerm_cognitive_account.openai.id
}

output "openai_name" {
  description = "Name of the Azure OpenAI service"
  value       = azurerm_cognitive_account.openai.name
}

output "openai_endpoint" {
  description = "Endpoint URL for the Azure OpenAI service"
  value       = azurerm_cognitive_account.openai.endpoint
}

output "deployment_name" {
  description = "Name of the GPT-4 deployment"
  value       = azurerm_cognitive_deployment.gpt4.name
}

output "private_endpoint_id" {
  description = "ID of the Private Endpoint"
  value       = azurerm_private_endpoint.openai.id
}

output "private_endpoint_ip" {
  description = "Private IP address of the Private Endpoint"
  value       = azurerm_private_endpoint.openai.private_service_connection[0].private_ip_address
}

output "private_dns_zone_id" {
  description = "ID of the Private DNS Zone"
  value       = azurerm_private_dns_zone.openai.id
}
