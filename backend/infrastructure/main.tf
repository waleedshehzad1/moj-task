# Configure the Azure Provider
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "~> 2.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }

  # Configure remote state storage in Azure Storage
  backend "azurerm" {
    resource_group_name  = "hmcts-terraform-state-rg"
    storage_account_name = "hmctsterraformstate"
    container_name       = "terraform-state"
    key                  = "task-api.terraform.tfstate"
  }
}

# Configure the Azure Provider features
provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = true
      recover_soft_deleted_key_vaults = true
    }
    
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}

# Data sources for existing resources
data "azurerm_client_config" "current" {}

data "azuread_client_config" "current" {}

# Local values for common configurations
locals {
  # Environment configuration
  environment_config = {
    dev = {
      environment = "development"
      location    = "UK South"
      sku_name    = "B1"
      db_sku      = "B_Gen5_1"
      redis_sku   = "Basic"
    }
    staging = {
      environment = "staging"
      location    = "UK South"
      sku_name    = "S1"
      db_sku      = "GP_Gen5_2"
      redis_sku   = "Standard"
    }
    prod = {
      environment = "production"
      location    = "UK South"
      sku_name    = "P1v2"
      db_sku      = "GP_Gen5_4"
      redis_sku   = "Premium"
    }
  }

  # Current environment configuration
  env_config = local.environment_config[var.environment]

  # Common tags
  common_tags = {
    Environment     = var.environment
    Project         = "HMCTS-Task-Management"
    Department      = "Justice"
    CostCentre     = "HMCTS"
    Owner          = "HMCTS-Dev-Team"
    CreatedBy      = "Terraform"
    CreatedDate    = formatdate("YYYY-MM-DD", timestamp())
    LastModified   = formatdate("YYYY-MM-DD", timestamp())
  }

  # Application configuration
  app_settings = {
    NODE_ENV                    = local.env_config.environment
    PORT                       = "3000"
    API_VERSION               = "v1"
    
    # Database settings (will be injected from Key Vault)
    DB_HOST                   = azurerm_postgresql_flexible_server.main.fqdn
    DB_PORT                   = "5432"
    DB_NAME                   = azurerm_postgresql_flexible_server_database.main.name
    DB_SSL                    = "true"
    
    # Redis settings
    REDIS_HOST               = azurerm_redis_cache.main.hostname
    REDIS_PORT               = azurerm_redis_cache.main.ssl_port
    REDIS_SSL                = "true"
    
    # Application Performance Monitoring
    DYNATRACE_ENABLED        = "true"
    DYNATRACE_TENANT_ID      = var.dynatrace_tenant_id
    
    # Security settings - Allow all origins
    CORS_ORIGIN              = "*"
    CORS_CREDENTIALS         = "true"
    
    # Logging settings
    LOG_LEVEL                = var.environment == "production" ? "warn" : "info"
    
    # Rate limiting
    RATE_LIMIT_WINDOW_MS     = "900000"
    RATE_LIMIT_MAX_REQUESTS  = var.environment == "production" ? "100" : "1000"
    
    # Health check settings
    HEALTH_CHECK_ENABLED     = "true"
    HEALTH_CHECK_INTERVAL    = "30000"
    
    # Swagger documentation
    SWAGGER_ENABLED          = var.environment != "production" ? "true" : "false"
    
    # Azure-specific settings
    AZURE_CLIENT_ID          = azuread_application.main.application_id
    AZURE_TENANT_ID          = data.azurerm_client_config.current.tenant_id
    
    # Application Insights
    APPINSIGHTS_INSTRUMENTATIONKEY = azurerm_application_insights.main.instrumentation_key
    APPLICATIONINSIGHTS_CONNECTION_STRING = azurerm_application_insights.main.connection_string
  }
}
