# =============================================================================
# Monitoring Module
# =============================================================================
# This module creates:
# - Log Analytics Workspace
# - Application Insights
# - Budget with alert notifications
# =============================================================================

# -----------------------------------------------------------------------------
# Log Analytics Workspace
# -----------------------------------------------------------------------------
resource "azurerm_log_analytics_workspace" "main" {
  name                = "log-${var.project_name}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = var.tags
}

# -----------------------------------------------------------------------------
# Application Insights
# -----------------------------------------------------------------------------
resource "azurerm_application_insights" "main" {
  name                = "${var.project_name}-insights-${var.random_suffix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = "web"

  # Disable IP masking for debugging (adjust for production)
  disable_ip_masking = false

  # Sampling percentage (100 = no sampling)
  sampling_percentage = 100

  tags = var.tags
}

# -----------------------------------------------------------------------------
# Budget for Cost Control
# -----------------------------------------------------------------------------
resource "azurerm_consumption_budget_resource_group" "main" {
  name              = "${var.project_name}-budget"
  resource_group_id = var.resource_group_id

  amount     = var.budget_amount
  time_grain = "Monthly"

  time_period {
    start_date = formatdate("YYYY-MM-01'T'00:00:00Z", timestamp())
  }

  # Alert at configured threshold (default 80%)
  notification {
    enabled   = true
    threshold = var.budget_alert_threshold
    operator  = "GreaterThan"

    contact_emails = [var.admin_email]

    threshold_type = "Actual"
  }

  # Additional alert at 100%
  notification {
    enabled   = true
    threshold = 100
    operator  = "GreaterThan"

    contact_emails = [var.admin_email]

    threshold_type = "Actual"
  }

  # Forecasted alert at 100%
  notification {
    enabled   = true
    threshold = 100
    operator  = "GreaterThan"

    contact_emails = [var.admin_email]

    threshold_type = "Forecasted"
  }

  lifecycle {
    ignore_changes = [
      # Start date changes on every apply
      time_period[0].start_date
    ]
  }
}
