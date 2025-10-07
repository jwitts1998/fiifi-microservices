#!/bin/bash

# Build the application
cd fiifi-core-api
npm run build
cd ..

# Create a simple deployment package
mkdir -p deploy
cp -r fiifi-core-api/dist deploy/
cp fiifi-core-api/package-cloudrun.json deploy/package.json

# Deploy to Cloud Run in us-east-1
gcloud run deploy fiifi-core-api-dev \
  --source ./deploy \
  --region us-east1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars NODE_ENV=development

# Clean up
rm -rf deploy
