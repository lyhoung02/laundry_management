FROM node:18-alpine

WORKDIR /app

# Copy application files (supports both repo-root and backend-folder build contexts)
COPY . .

# Install dependencies
RUN if [ -f /app/package.json ]; then \
			cd /app; \
		elif [ -f /app/backend/package.json ]; then \
			cd /app/backend; \
		else \
			echo "package.json not found in /app or /app/backend"; \
			exit 1; \
		fi && \
		if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# Expose the port
EXPOSE 5001

# Start the application
CMD ["sh", "-c", "if [ -f /app/package.json ]; then cd /app; else cd /app/backend; fi && npm start"]
