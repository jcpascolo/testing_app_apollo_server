# Use an official Node runtime as a parent image
FROM node:10.15.3-alpine

# Set the working directory to /app
WORKDIR /app
COPY . /app

# Copy the current directory contents into the container at /app
RUN npm install
RUN npm run build

# Install any needed packages specified in requirements.txt

# Make port 80 available to the world outside this container
EXPOSE 4000
EXPOSE 5432
EXPOSE 6379

# Define environment variable
ENV NAME World

# Run app.py when the container launches
CMD ["npm", "start"]