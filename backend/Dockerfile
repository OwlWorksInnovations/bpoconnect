FROM golang:1.23-alpine

# Install build dependencies
RUN apk add --no-cache git ca-certificates

WORKDIR /app

# Copy dependency files first
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o /bpo-api .

EXPOSE 8080

CMD ["/bpo-api"]