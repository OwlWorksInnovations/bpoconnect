FROM alpine:latest

WORKDIR /app

# Copy the pre-built linux binary from the repository
COPY bpo-api-linux /bpo-api

# Ensure it has execution permissions
RUN chmod +x /bpo-api

EXPOSE 8080

CMD ["/bpo-api"]