FROM node:slim
ADD . .
RUN npm install
RUN npm run build
COPY firebase.json .
EXPOSE 8080
CMD ["node", "index.js"]