# -------------------------------------
# 1. Base build stage (install deps & build backend)
# -------------------------------------
    FROM node:22-alpine AS builder

    WORKDIR /app
    
    COPY package*.json ./
    
    RUN npm install
    
    COPY . .
    
    RUN npm run build

 
    FROM node:22-alpine AS production
    
    WORKDIR /app
    
    COPY --from=builder /app/package*.json ./
    COPY --from=builder /app/dist ./dist
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/src/admin_ui ./src/admin_ui
    
    EXPOSE 3000
    
    CMD ["node", "dist/src/main.js"]