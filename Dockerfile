# -------------------------------------
# 1. Base build stage (install deps & build backend)
# -------------------------------------
    FROM node:22-alpine AS builder

    # Set working directory
    WORKDIR /app
    
    # Copy package.json and lock file
    COPY package*.json ./
    
    # Install dependencies
    RUN npm install
    
    # Copy full project
    COPY . .
    
    # Build backend and frontend
    RUN npm run build

    # Run seeders
    RUN npm run setup:db
    
    # -------------------------------------
    # 2. Production image
    # -------------------------------------
    FROM node:22-alpine AS production
    
    # Set working directory
    WORKDIR /app
    
    # Only copy needed artifacts from builder
    COPY --from=builder /app/package*.json ./
    COPY --from=builder /app/dist ./dist
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/src/admin_ui ./src/admin_ui
    COPY --from=builder /app/.env .env
    
    # Expose port
    EXPOSE 3000
    
    # Start the app
    CMD ["node", "dist/src/main.js"]