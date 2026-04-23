FROM golang:1.24-bookworm AS builder

# Install build essentials
RUN apt-get update && apt-get install -y git ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Set Go Proxy for better reliability
ENV GOPROXY=https://proxy.golang.org,direct

# Copy dependency files
COPY go.mod go.sum ./

# Clean cache and download
RUN go mod download && go mod verify

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o /bpo-api

# Use a tiny image for the final run
FROM debian:bookworm-slim

WORKDIR /

# Install ca-certificates (needed for TLS/external connections)
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /bpo-api /bpo-api

EXPOSE 8080

CMD ["/bpo-api"]