# Use official Node.js image for development
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose port for Vite
EXPOSE 5173

# Start the Vite development server, binding to 0.0.0.0 so it is accessible outside the container
CMD ["npm", "run", "dev", "--", "--host"]
