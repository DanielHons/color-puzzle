# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create a lightweight production image
FROM nginx:stable-alpine

# Copy the build output from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Set default command to serve the app
CMD ["nginx", "-g", "daemon off;"]