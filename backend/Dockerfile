FROM golang:1.23-alpine

WORKDIR /app

# Copy all files including vendor
COPY . .

# Build using vendor folder to avoid networking
RUN CGO_ENABLED=0 GOOS=linux go build -mod=vendor -o /bpo-api .

EXPOSE 8080

CMD ["/bpo-api"]