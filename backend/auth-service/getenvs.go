package main

import (
	"fmt"
	"github.com/joho/godotenv"
	"os"
)

func getenvs(env string) (string, error) {
	err := godotenv.Load()
	if err != nil {
		logger.Println("Ошибка получения переменных из .env файла: " + err.Error())
		return "", fmt.Errorf("Ошибка получения переменных из .env файла: " + err.Error())
	}

	envToReturn := os.Getenv(env)
	if envToReturn == "" {
		logger.Printf("Переменная %s отсутствует в .env\n", envToReturn)
		return "", fmt.Errorf("Переменная %s отсутствует в .env\n", envToReturn)
	}

	return envToReturn, nil
}
