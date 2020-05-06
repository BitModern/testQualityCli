FROM node:10.15-alpine
ENV APPDIR=/usr/src/app

RUN apk update && \
    apk add --no-cache bash

# Create app directory
COPY . $APPDIR
WORKDIR $APPDIR

RUN yarn
# we build to ./dist folder
RUN yarn build
