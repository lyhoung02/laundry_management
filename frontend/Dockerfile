FROM node:18-alpine
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000

# Copy application files (supports both repo-root and frontend-folder build contexts)
COPY . .

# Install dependencies and build
RUN if [ -f /app/package.json ]; then \
			cd /app; \
		elif [ -f /app/frontend/package.json ]; then \
			cd /app/frontend; \
		else \
			echo "package.json not found in /app or /app/frontend"; \
			exit 1; \
		fi && \
		if [ -f package-lock.json ]; then npm ci; else npm install; fi && \
		npm run build

EXPOSE 3000

CMD ["sh", "-c", "if [ -f /app/package.json ]; then cd /app; else cd /app/frontend; fi && npm start"]
