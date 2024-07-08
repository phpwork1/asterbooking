FROM node:20.15

WORKDIR /usr/app

COPY . .

RUN npm ci

CMD ["./node_modules/.bin/pm2 start book.js"]