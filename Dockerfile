# build stage
FROM node:lts-alpine as build-stage
WORKDIR /usr/src/app
COPY package*.json .
RUN npm install
COPY . .
EXPOSE 8080

CMD [ "npm", "run", "start" ]