FROM node:20.15

ARG AIA_DIRECT_PAT

WORKDIR /usr/app

RUN npm ci

CMD ["pm2 start book.js"]