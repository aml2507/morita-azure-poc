# Morita Azure POC - Terraform Infrastructure

## Overview

This Terraform configuration deploys a secure Azure infrastructure for the Morita POC, demonstrating enterprise-grade security patterns with Azure OpenAI.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Azure Resource Group                         │
│                     (rg-morita-poc)                             │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                Virtual Network (10.0.0.0/16)             │   │
│  │                                                          │   │
│  │  ┌──────────────────────┐  ┌──────────────────────────┐ │   │
│  │  │   App Subnet         │  │   PE Subnet              │ │   │
│  │  │   (10.0.1.0/24)      │  │   (10.0.2.0/24)          │ │   │
│  │  │                      │  │                          │ │   │
│  │  │  ┌────────────────┐  │  │  ┌────────────────────┐  │ │   │
│  │  │  │  App Service   │  │  │  │ Private Endpoint   │  │ │   │
│  │  │  │  (VNet Int.)   │──────▶│ (Azure OpenAI)     │  │ │   │
│  │  │  └────────────────┘  │  │  └─────────┬──────────┘  │ │   │
│  │  └──────────────────────┘  └─────────────┼────────────┘ │   │
│  │                                          │              │   │
│  │  ┌───────────────────────────────────────▼────────────┐ │   │
│  │  │              Private DNS Zone                       │ │   │
│  │  │         (privatelink.openai.azure.com)             │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐  │
│  │   Azure OpenAI      │  │   Application Insights          │  │
│  │   (GPT-4)           │  │   + Log Analytics               │  │
│  │   Public: DISABLED  │  │                                 │  │
│  └─────────────────────┘  └─────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │   Budget Alert (10 EUR/month @ 80%)                         ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Security Features

- **Private Endpoint**: Azure OpenAI has public access disabled; only accessible via Private Endpoint
- **Managed Identity**: App Service uses system-assigned identity for Azure RBAC (no API keys)
- **VNet Integration**: App Service routes traffic through the VNet
- **RBAC**: Least privilege access with "Cognitive Services OpenAI User" role

## Prerequisites

1. Azure Subscription with OpenAI access
2. Terraform >= 1.5
3. Terraform Cloud account (or local state)
4. Service Principal with Contributor role

## Module Structure

```
terraform/
├── main.tf              # Main configuration, module calls
├── variables.tf         # Input variables
├── outputs.tf           # Output values
├── provider.tf          # Provider configuration
├── terraform.tfvars.example
└── modules/
    ├── network/         # VNet, Subnets
    ├── openai/          # Azure OpenAI, Private Endpoint, DNS
    ├── app-service/     # App Service, Service Plan, RBAC
    └── monitoring/      # App Insights, Log Analytics, Budget
```

## Quick Start

### 1. Configure Terraform Cloud

Update `provider.tf` with your organization:

```hcl
cloud {
  organization = "your-organization"
  workspaces {
    name = "morita-azure-poc"
  }
}
```

### 2. Set Variables in Terraform Cloud

Required environment variables:
- `ARM_CLIENT_ID`
- `ARM_CLIENT_SECRET`
- `ARM_TENANT_ID`
- `ARM_SUBSCRIPTION_ID`

Required Terraform variables:
- `admin_email` (sensitive)

### 3. Initialize and Apply

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|----------|
| admin_email | Email for budget alerts | string | - | yes |
| project_name | Project name | string | "morita" | no |
| environment | Environment name | string | "poc" | no |
| location | Azure region | string | "westeurope" | no |
| budget_amount | Monthly budget (EUR) | number | 10 | no |

See `variables.tf` for complete list.

## Outputs

| Name | Description |
|------|-------------|
| app_service_url | URL of the deployed application |
| openai_endpoint | Azure OpenAI endpoint |
| openai_deployment_name | Name of the GPT-4 deployment |
| private_endpoint_ip | Private IP of the OpenAI endpoint |

See `outputs.tf` for complete list.

## Estimated Costs

| Resource | Estimated Monthly Cost |
|----------|----------------------|
| Azure OpenAI (GPT-4) | ~€3-5 (usage-based) |
| App Service (B1) | ~€10 |
| Private Endpoint | ~€6 |
| Other (Storage, DNS) | ~€3 |
| **Total** | **~€22-24/month** |

## Cleanup

```bash
terraform destroy
```

## Notes

- Azure OpenAI requires subscription approval
- GPT-4 model availability varies by region
- West Europe is recommended for this POC
