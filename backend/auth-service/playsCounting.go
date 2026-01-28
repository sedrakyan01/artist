package main

import (
	"github.com/gorilla/websocket"
	"net/http"
)

func playsCounter(w http.ResponseWriter, r *http.Request) {
	var upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		logger.Printf("Websocker connection error: %v\n", err)
		return
	}
	defer conn.Close()

}
