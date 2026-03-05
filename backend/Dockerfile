FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# Copy application files
COPY . .

# Expose the port
EXPOSE 5001

# Start the application
CMD ["npm", "start"]
