FROM node:latest

ENV NODE_ENV production

RUN mkdir /node

WORKDIR /node

ADD ./node /node

ADD ./configs.js /node

RUN npm install --production

CMD ["node", "./main/app.js"]
