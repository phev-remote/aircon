FROM node:10
WORKDIR /usr/app/
COPY package*.json /usr/app/
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["node", "index.js"]