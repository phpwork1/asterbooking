FROM node:20.15

WORKDIR /usr/app

COPY . .

RUN npm ci

CMD ["sh", "-c", "pm2 start book.js"]