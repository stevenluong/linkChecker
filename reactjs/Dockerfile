FROM node:latest
RUN mkdir /reactjs
WORKDIR /reactjs
ADD package.json /reactjs/package.json
RUN npm install --save react react-dom
RUN npm install
RUN npm install -g http-server


