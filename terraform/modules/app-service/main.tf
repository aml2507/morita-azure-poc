# =============================================================================
# App Service Module
# =============================================================================
# This module creates:
# - App Service Plan (Linux, Basic tier)
# - App Service (Node.js)
# - System-assigned Managed Identity
# - VNet Integration
# - RBAC assignment for OpenAI access
# =============================================================================

# -----------------------------------------------------------------------------
# App Service Plan
# -----------------------------------------------------------------------------
resource "azurerm_service_plan" "main" {
  name                = "asp-${var.project_name}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  os_type             = "Linux"
  sku_name            = var.sku

  tags = var.tags
}

# -----------------------------------------------------------------------------
# App Service (Linux Web App)
# -----------------------------------------------------------------------------
resource "azurerm_linux_web_app" "main" {
  name                = "${var.project_name}-app-${var.random_suffix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  service_plan_id     = azurerm_service_plan.main.id

  # Enable HTTPS only
  https_only = true

  # System-assigned Managed Identity for Azure RBAC
  identity {
    type = "SystemAssigned"
  }

  # VNet Integration for private connectivity
  virtual_network_subnet_id = var.app_subnet_id

  site_config {
    # Node.js 20 LTS runtime
    application_stack {
      node_version = var.node_version
    }

    # Always on for consistent performance
    always_on = true

    # Health check endpoint
    health_check_path = "/api/health"

    # Minimum TLS version
    minimum_tls_version = "1.2"

    # Enable HTTP/2
    http2_enabled = true

    # CORS settings (adjust as needed)
    cors {
      allowed_origins = ["*"]
    }
  }

  # Application settings (environment variables)
  app_settings = {
    # Azure OpenAI Configuration
    "AZURE_OPENAI_ENDPOINT"   = var.openai_endpoint
    "AZURE_OPENAI_DEPLOYMENT" = var.openai_deployment_name

    # Application Insights (if provided)
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = var.app_insights_connection_string
    "ApplicationInsightsAgent_EXTENSION_VERSION" = "~3"

    # Node.js settings
    "WEBSITE_NODE_DEFAULT_VERSION" = "~20"
    "SCM_DO_BUILD_DURING_DEPLOYMENT" = "true"

    # Managed Identity for Azure OpenAI (no API key needed)
    "AZURE_OPENAI_USE_MANAGED_IDENTITY" = "true"
  }

  # Logging configuration
  logs {
    detailed_error_messages = true
    failed_request_tracing  = true

    http_logs {
      file_system {
        retention_in_days = 7
        retention_in_mb   = 35
      }
    }
  }

  tags = var.tags

  lifecycle {
    ignore_changes = [
      # Ignore changes that may be modified by deployment processes
      app_settings["WEBSITE_RUN_FROM_PACKAGE"],
    ]
  }
}

# -----------------------------------------------------------------------------
# RBAC: Grant App Service access to Azure OpenAI
# -----------------------------------------------------------------------------
# The Managed Identity of the App Service needs "Cognitive Services OpenAI User"
# role to call the Azure OpenAI API
resource "azurerm_role_assignment" "openai_user" {
  scope                = var.openai_id
  role_definition_name = "Cognitive Services OpenAI User"
  principal_id         = azurerm_linux_web_app.main.identity[0].principal_id
}
