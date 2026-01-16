# Morita Azure POC - Architecture

## Overview
This POC demonstrates Azure OpenAI integration with enterprise-grade security using Private Endpoints, Managed Identity, and Infrastructure as Code.

## Architecture Diagram
```
[User] → [App Service + VNet Integration] → [Private Endpoint] → [Azure OpenAI]
                                               ↓
                                    [Private DNS Zone]
```

## Security Features
- Private Endpoint: Azure OpenAI not exposed to internet
- Managed Identity: Zero secrets in code
- VNet Integration: App Service in private network
- RBAC: Least privilege access

## Components
1. VNet with 2 subnets (app, private endpoints)
2. Azure OpenAI (GPT-4) with public access disabled
3. Private Endpoint + Private DNS Zone
4. App Service with VNet Integration
5. Application Insights for monitoring
6. Budget alerts for cost control

## Estimated Monthly Cost
- Azure OpenAI: ~€3-5 (usage-based)
- App Service B1: ~€10
- Private Endpoint: ~€6
- Other: ~€3
**Total: ~€22-24/month**

