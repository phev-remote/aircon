FROM node:slim
ADD . .
RUN npm install
EXPOSE 8080
CMD ["node", "index.js"]