package logger

import (
	"log"
	"os"
)

func Loggerfunc() *log.Logger {
	file, err := os.OpenFile("logging.log", os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0666)
	if err != nil {
		log.Fatalf("Ошибка открытия файла, %v", err)
	}

	logger := log.New(file, "INFO:", log.Ldate|log.Ltime|log.Lshortfile)

	return logger
}
