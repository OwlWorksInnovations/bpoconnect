FROM golang:1.23-bookworm AS builder

WORKDIR /app

# Copy the entire backend directory including the vendor folder
COPY . .

# Build using the vendor folder (-mod=vendor)
# We build specifically for Linux/AMD64 to be safe
RUN CGO_ENABLED=0 GOOS=linux go build -mod=vendor -o bpo-api .

FROM debian:bookworm-slim

WORKDIR /

# Install certificates for secure connections
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy the binary from builder
COPY --from=builder /app/bpo-api /bpo-api

EXPOSE 8080

CMD ["/bpo-api"]