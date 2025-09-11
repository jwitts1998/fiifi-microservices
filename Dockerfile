# =================================================================
# Development Dockerfile for Node 14
# This file sets up the environment for local development with
# hot-reloading.
# =================================================================
FROM node:14-bullseye

# The README doesn't specify any native dependencies, but python and build-essential
# are often required for `node-gyp`, so we include them just in case.
RUN apt-get update && apt-get install -y python3 build-essential

WORKDIR /app

# Copy all package.json files first to leverage Docker's cache.
# This layer only gets rebuilt if a package.json file changes.
COPY package*.json ./
COPY site_main/package*.json ./site_main/
COPY server_api/package*.json ./server_api/

# Install all dependencies, including devDependencies.
# We use the same --legacy-peer-deps flag you had.
RUN npm install --legacy-peer-deps
RUN cd site_main && npm install --legacy-peer-deps
RUN cd server_api && npm install

# Copy the rest of the source code into the image.
# This will be overlaid by a volume mount when you run the container,
# allowing for hot-reloading.
COPY . .

# Expose the default Vue development port from the README.
EXPOSE 8000

# Default command to start the frontend dev server with hot-reloading.
CMD ["npm", "run", "dev", "--prefix", "site_main"]