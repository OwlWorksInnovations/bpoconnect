FROM golang:1.24-bookworm AS builder

WORKDIR /app

# Copy the entire backend directory including the vendor folder
COPY . .

# Build the application using the vendor folder (-mod=vendor)
# This means the builder DOES NOT need internet access to download modules
RUN CGO_ENABLED=0 GOOS=linux go build -mod=vendor -o /bpo-api

FROM debian:bookworm-slim

WORKDIR /

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /bpo-api /bpo-api

EXPOSE 8080

CMD ["/bpo-api"]