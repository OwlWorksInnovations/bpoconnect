FROM golang:1.24-alpine AS builder

# git is required to fetch some go modules
RUN apk add --no-cache git

WORKDIR /app

# Install dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o /bpo-api

FROM alpine:latest

WORKDIR /

COPY --from=builder /bpo-api /bpo-api

EXPOSE 8080

CMD ["/bpo-api"]