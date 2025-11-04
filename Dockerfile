FROM node:20 AS dependencies

RUN mkdir /app
WORKDIR /app

COPY package.json ./
RUN yarn install

COPY . .

RUN yarn run build:prod

EXPOSE 80
CMD [ "npm", "run", "start:prod" ][root@localhost holdev-project]# 