package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, `{"status":"ok"}`)
	})
	fmt.Println("Starting server on :8080...")
	http.ListenAndServe(":8080", nil)
}
