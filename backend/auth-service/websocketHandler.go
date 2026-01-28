package main

import (
	"aiartistprod/backend/auth-service/Kafka"
	"github.com/gorilla/websocket"
	"net/http"
)

// @Summary События в реальном времени
// @Description Этот эндпоинт позволяет получать события в реальном времени по протоколу websocket
// @Tags live actions
// @Produce application/json
// @Success 200 {string} string "События"
// @Router /liveactions [get]
func websocketPageHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./react/websocketpage.html")
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func websocketHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		logger.Printf("Websocker connection error: %v\n", err)
		return
	}
	defer conn.Close()

	Kafka.ConnUpdater(conn)
	Kafka.Reader("users_events", logger)
}
