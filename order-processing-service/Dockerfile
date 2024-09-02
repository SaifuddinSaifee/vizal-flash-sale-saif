FROM node:14-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

ENV NODE_ENV=production
ENV MONGODB_URI=mongodb://mongodb:27017/flipzon
ENV REDIS_HOST=redis
ENV REDIS_PORT=6379
ENV STOCK_SERVICE_URL=http://stock-management-service:3003/api/stock

CMD ["node", "src/app.js"]