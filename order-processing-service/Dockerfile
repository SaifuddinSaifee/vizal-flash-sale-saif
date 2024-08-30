FROM node:14-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Define environment variables
ENV NODE_ENV=production
ENV MONGODB_URI=mongodb://mongodb:27017/flipzon
ENV REDIS_HOST=redis
ENV REDIS_PORT=6379
ENV STOCK_SERVICE_URL=http://stock-management-service:3000/api/stock

# Run the application
CMD ["node", "src/app.js"]