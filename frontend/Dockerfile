FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Ensure data directory and db.json exists for the MVP fallback
RUN mkdir -p data
RUN echo '{"users": [], "jobs": [], "offers": [], "messages": []}' > data/db.json

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
