FROM golang:1.23-alpine

WORKDIR /app

COPY go.mod ./
# No dependencies to download

COPY main.go ./

RUN CGO_ENABLED=0 GOOS=linux go build -o /bpo-api main.go

EXPOSE 8080

CMD ["/bpo-api"]