# Configure the Google Cloud Provider
terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Variables
variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

# MongoDB Atlas (external)
# Note: MongoDB Atlas is managed externally
# This would be configured through MongoDB Atlas UI or API

# Cloud Run for microservices
resource "google_cloud_run_service" "core_api" {
  name     = "fiifi-core-api-${var.environment}"
  location = var.region

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/fiifi-core-api:latest"
        
        ports {
          container_port = 3000
        }
        
        env {
          name  = "NODE_ENV"
          value = var.environment
        }
        
        env {
          name  = "PORT"
          value = "3000"
        }
        
        # MongoDB URI would be set via environment variables
        # or Google Secret Manager
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Cloud Run for shared library (if needed as a service)
resource "google_cloud_run_service" "shared_lib" {
  name     = "fiifi-shared-${var.environment}"
  location = var.region

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/fiifi-shared:latest"
        
        ports {
          container_port = 3001
        }
        
        env {
          name  = "NODE_ENV"
          value = var.environment
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Cloud Storage for static assets
resource "google_storage_bucket" "static_assets" {
  name          = "fiifi-static-assets-${var.environment}-${var.project_id}"
  location      = var.region
  force_destroy = true

  uniform_bucket_level_access = true

  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

# Cloud Logging
resource "google_logging_project_sink" "fiifi_logs" {
  name        = "fiifi-logs-${var.environment}"
  destination = "storage.googleapis.com/${google_storage_bucket.static_assets.name}/logs"
  filter      = "resource.type=\"cloud_run_revision\""
}

# Outputs
output "core_api_url" {
  value = google_cloud_run_service.core_api.status[0].url
}

output "shared_lib_url" {
  value = google_cloud_run_service.shared_lib.status[0].url
}

output "static_assets_bucket" {
  value = google_storage_bucket.static_assets.name
}
