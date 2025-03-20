FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies first to leverage Docker caching
COPY package.json yarn.lock ./

# Install production dependencies only
RUN yarn install --frozen-lockfile --production=false

# Copy the rest of the application code
COPY . .

# Build TypeScript
RUN yarn build

# Remove dev dependencies to reduce image size
RUN yarn install --frozen-lockfile --production=true

# Expose API port
EXPOSE 4000

# Set NODE_ENV
ENV NODE_ENV=production

# Use non-root user for security
USER node

# Command to run the application
CMD ["node", "dist/index.js"] 