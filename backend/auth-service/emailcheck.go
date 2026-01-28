package main

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"gopkg.in/gomail.v2"
	"log"
	"math/rand/v2"
	"net/http"
	"strconv"
	"time"
)

// emailCheckHandler Проверка наличия имейла в БД при регистрации и авторизации пользователя
// @Summary Проверка наличия имейла в БД при регистрации и авторизации пользователя (отправка данных со страницы /signup)
// @Description Проверка наличия имейла в БД при регистрации и авторизации пользователя
// @Tags authorization
// @Produce application/json
// @Param email query string true "email пользователя"
// @Success 200 {object} map[string]bool "Наличие или отсутствие email в БД, json("exists": exists(тип bool))"
// @Failure 400 {string} string "Неверный метод запроса для проверки email"
// @Failure 500 {string} string "Ошибка проверки наличия email, ошибка отправки ответа"
// @Router /emailchecksend [GET]
func emailCheckHandler(w http.ResponseWriter, r *http.Request) {
	logger.Println("Проверка имейл начала работу")

	if r.Method != http.MethodGet {
		http.Error(w, "Неверный метод запроса для проверки email", http.StatusBadRequest)
		logger.Println("Неверный метод запроса для проверки email")
		return
	}

	userEmail := r.URL.Query().Get("email")

	var exists bool

	err := DB.QueryRow(`SELECT EXISTS (SELECT 1 FROM users WHERE email = $1)`, userEmail).Scan(&exists)
	if err != nil {
		http.Error(w, "Ошибка проверки наличия email: "+err.Error(), http.StatusInternalServerError)
		logger.Println("Ошибка проверки наличия email: " + err.Error())
		return
	}

	logger.Printf("Email %s проверен успшено %t", userEmail, exists)

	var answer string

	if !exists {
		answer = "registration code has been send"
		err = approvingMessageSender(userEmail)
		if err != nil {
			http.Error(w, "Registration error", http.StatusInternalServerError)
			logger.Println("Ошибка проверки наличия email: " + err.Error())
			return
		}
	} else {
		answer = fmt.Sprintf("%t", exists)
	}

	w.Header().Set("Content-Type", "application/json")

	err = json.NewEncoder(w).Encode(map[string]string{
		"exists": answer,
	})
	if err != nil {
		logger.Println("Ошибка отправки проверки наличия email: " + err.Error())
		http.Error(w, "Ошибка отправки проверки наличия email: "+err.Error(), http.StatusInternalServerError)
	}
}

func approvingMessageSender(email string) error {
	code := 100000 + rand.IntN(899999)

	timeToSave := 5 * time.Minute

	err := redisCodeSave(email, strconv.Itoa(code), timeToSave)
	if err != nil {
		logger.Println("Ошибка сохранения кода подтверждения регистрации:" + err.Error())
		return err
	}

	smtpHost := "smtp.gmail.com"
	smtpPort := 587
	sender := "museforlove@gmail.com"
	password := "lbdg ziwo azrr gnpw"

	message := gomail.NewMessage()

	message.SetHeader("From", sender)
	message.SetHeader("To", email)
	message.SetHeader("Тема", "Ваш код подтверждения")

	message.SetBody("text/plain", fmt.Sprintf("Ваш код подтверждения: %d", code))

	dialer := gomail.NewDialer(smtpHost, smtpPort, sender, password)

	err = dialer.DialAndSend(message)
	if err != nil {
		logger.Println("Ошибка отправки кода подтверждения регистрации:" + err.Error())
		return err
	}

	return nil
}

func redisCodeSave(email string, code string, timeToSave time.Duration) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := rdb.Set(ctx, email, code, timeToSave).Err()
	if err != nil {
		return err
	}

	return nil
}

func registerCodeCheckHandler(w http.ResponseWriter, r *http.Request) {
	/*if r.Method != http.MethodPost {
		fmt.Println(r.Method)
		http.Error(w, "Wrong request type", http.StatusBadRequest)
		logger.Println("Wrong request type")
		return
	}*/

	email := r.URL.Query().Get("email")
	code := r.URL.Query().Get("code")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	codeSaved, err := rdb.Get(ctx, email).Result()
	if err != nil {
		http.Error(w, "Try again later", http.StatusInternalServerError)
		logger.Println("Eror getting register code from redis:" + err.Error())
		return
	}

	if code == codeSaved {
		err = rdb.Del(ctx, email).Err()
		if err != nil {
			log.Fatalf("Ошибка удаления ключа: %v", err)
		}

		hash := sha256Hash(code)
		err = redisCodeSave(email, hash, 10*time.Minute)
		if err != nil {
			log.Fatalf("Registration error: %v", err)
		}
		w.Write([]byte(hash))
	} else {
		w.Write([]byte("false"))
	}
}

func sha256Hash(input string) string {
	sum := sha256.Sum256([]byte(input))
	return hex.EncodeToString(sum[:])
}
