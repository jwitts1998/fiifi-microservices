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
  default     = "us-east1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
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
output "static_assets_bucket" {
  value = google_storage_bucket.static_assets.name
}

output "logging_sink" {
  value = google_logging_project_sink.fiifi_logs.name
}

output "region" {
  value = var.region
}
