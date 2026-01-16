# =============================================================================
# Terraform Configuration for Morita Azure POC
# =============================================================================
# This configuration uses Terraform Cloud as the backend for state management
# and Azure as the cloud provider for infrastructure deployment.
# =============================================================================

terraform {
  # Terraform Cloud configuration
  cloud {
    organization = "mora-poc"

    workspaces {
      name = "morita-azure-poc"
    }
  }

  required_version = ">= 1.5"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
}

# Azure Provider configuration
# Authentication is handled via environment variables in Terraform Cloud:
# - ARM_CLIENT_ID
# - ARM_CLIENT_SECRET
# - ARM_TENANT_ID
# - ARM_SUBSCRIPTION_ID
provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
    cognitive_account {
      purge_soft_delete_on_destroy = true
    }
  }
}

provider "random" {}
