FROM golang:1.23-bookworm AS builder

WORKDIR /app

# Copy all files
COPY . .

# Explicitly list files to verify they are present in the build log
RUN ls -la && ls -la vendor

# Build the application
# We'll build to a local path 'app-bin' instead of root
RUN CGO_ENABLED=0 GOOS=linux go build -mod=vendor -o /app/app-bin .

FROM debian:bookworm-slim

WORKDIR /root/

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy the binary from the builder
COPY --from=builder /app/app-bin ./bpo-api

EXPOSE 8080

CMD ["./bpo-api"]