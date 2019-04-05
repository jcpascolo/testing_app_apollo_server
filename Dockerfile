# Use an official Node runtime as a parent image
FROM node:10.15.3-alpine as base

# Set the working directory to /app
WORKDIR /app
COPY . /app

# Copy the current directory contents into the container at /app
RUN npm install
RUN npm run build

# Make port 80 available to the world outside this container


# Define environment variable

# Run app.py when the container launches
#CMD ["node", "dist/server.js"]


FROM node:10.15.3-alpine
WORKDIR /app
COPY --from=base /app/dist /app
COPY --from=base /app/package.json /app
RUN npm install --production
EXPOSE 4000
CMD ["node", "server.js"]

