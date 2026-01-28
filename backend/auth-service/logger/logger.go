package logger

import (
	"log"
	"os"
)

var Logger *log.Logger

func Loggerfunc() {
	file, err := os.OpenFile("logs.log", os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0666)
	if err != nil {
		log.Fatalf("Ошибка открытия файла, %v", err)
	}

	Logger = log.New(file, "INFO:", log.Ldate|log.Ltime|log.Lshortfile)
}
