# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Create a .env file and set environment variables
# Note: In a production environment, you should use secrets management instead
RUN echo "REACT_APP_OPENAI_API_KEY=${REACT_APP_OPENAI_API_KEY}" > .env && \
    echo "REACT_APP_ANTHROPIC_API_KEY=${REACT_APP_ANTHROPIC_API_KEY}" >> .env

# Build the application
RUN npm run build

# Install a simple HTTP server for serving static content
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["serve", "-s", "build", "-l", "3000"]
