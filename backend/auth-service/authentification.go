package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// UserData структура данных пользователя
type UserData struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}

// authentification Аутентификация пользователя
// @Summary Аутентификация пользователя
// @Description Принимает email/username и пароль согласно структуре UserData, и при успехе возвращает сообщение json и токены: refresh в Cookies "refresh_token" и access в заголовке "Authorization"
// @Tags authorization
// @Accept application/json
// @Produce application/json
// @Param request body UserData true "Данные от клиента для авторизации"
// @Success 200 {object} map[string]string "Успешный ответ json("message": "result") с токенами в Cookies и заголовке"
// @Header 200 {string} Authorization "Bearer <AccessJWTToken>"
// @Cookie 200 {string} refresh_token "Refresh JWT Token"
// @Failure 400 {string} string "Invalid request method, Data error"
// @Failure 401 {string} string "Wrong password"
// @Failure 500 {string} string "Server error"
// @Router /signinsend [POST]
func authentification(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		http.Error(w, "Неверный метод запроса", http.StatusBadRequest)
		logger.Println("Неверный метод запроса")
		return
	}

	data := &UserData{}
	err := json.NewDecoder(r.Body).Decode(data)
	if err != nil {
		http.Error(w, "Ошибка сериализации данных: "+err.Error(), http.StatusBadRequest)
		logger.Println("Ошибка сериализации данных: " + err.Error())
		return
	}

	var password, parameter, column, username, email string

	if data.Email != "" {
		parameter = data.Email
		column = "email"
		username = ""
		email = data.Email
	} else if data.Username != "" {
		parameter = data.Username
		column = "user_name"
		email = ""
		username = data.Username
	}
	query := fmt.Sprintf("SELECT password FROM users WHERE %s = $1", column)
	err = DB.QueryRow(query, parameter).Scan(&password)
	if err == sql.ErrNoRows {
		jsonResponse(w, http.StatusUnauthorized, column+" does not exist")
	} else if err != nil {
		jsonResponse(w, http.StatusInternalServerError, "database connection error")
	} else if !checkHashedPassword(data.Password, password) {
		jsonResponse(w, http.StatusUnauthorized, "wrong password")
	} else if checkHashedPassword(data.Password, password) {

		AccessJWTToken, RefreshJWTToken, err := getUserIDAndTokens(username, email, w)
		if err != nil {
			logger.Println(err)
			return
		}

		jsonResponseWithTokens(w, http.StatusOK, "password is correct", AccessJWTToken, RefreshJWTToken)
	}
}

func getUserIDAndTokens(username, email string, w http.ResponseWriter) (string, string, error) {
	var userID int

	if email != "" {
		err := DB.QueryRow("SELECT id, user_name FROM users WHERE email = $1", email).Scan(&userID, &username)
		if err != nil {
			logger.Println("Ошибка получения userID из базы данных:", err.Error())
			http.Error(w, "Ошибка получения userID из базы данных: "+err.Error(), http.StatusInternalServerError)

			return "", "", err
		}
	} else {
		err := DB.QueryRow("SELECT id FROM users WHERE user_name = $1", username).Scan(&userID)
		if err != nil {
			logger.Println("Ошибка получения userID из базы данных:", err.Error())
			http.Error(w, "Ошибка получения userID из базы данных: "+err.Error(), http.StatusInternalServerError)

			return "", "", err
		}
	}

	AccessJWTToken, err := generateAccessJWTToken(username, userID, JWTAccessSecretKey)
	if err != nil {
		logger.Println("Ошибка получения AccessJWTToken:", err)
		return "", "", err
	}
	RefreshJWTToken, err := generateRefreshJWTToken(JWTRefreshSecretKey)
	if err != nil {
		logger.Println("Ошибка получения RefreshJWTToken:", err)
		return "", "", err
	}
	return AccessJWTToken, RefreshJWTToken, nil
}

func jsonResponse(w http.ResponseWriter, statusCode int, message string) {

	data, err := json.Marshal(map[string]string{
		"answer": message,
	})
	if err != nil {
		http.Error(w, "Ошибка сериализации данных для отправки: "+err.Error(), http.StatusInternalServerError)
		logger.Println("Ошибка сериализации данных для отправки: " + err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	w.Write(data)

	logger.Println("Результат аутентификации отправлен:", message)

}

func jsonResponseWithTokens(w http.ResponseWriter, statusCode int, message string, AccessJWTToken, RefreshJWTToken string) {

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    RefreshJWTToken,
		Expires:  time.Now().Add(72 * time.Hour),
		HttpOnly: true, // Ограничиваем доступ к cookie только через HTTP (защита от XSS)
		Secure:   true, // Устанавливайте true в production для работы только через HTTPS
		Path:     "/",  // Cookie доступен для всех путей
	})

	response := map[string]string{
		"message": message,
	}

	jsonData, err := json.Marshal(response)
	if err != nil {
		http.Error(w, "Ошибка кодирования JSON", http.StatusInternalServerError)
		logger.Println("Ошибка кодирования JSON-ответа:", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Authorization", "Bearer "+AccessJWTToken)
	w.WriteHeader(statusCode)
	w.Write(jsonData)
}

// logOutHandler Выход из системы - удаление токенов
// @Summary Выход из системы - удаление токенов
// @Description Возвращает пустые токены и сообщение о выходе из системы
// @Tags authorization
// @Produce application/json
// @Success 200 {object} map[string]string "Успешный ответ json("message": "Вы успешно вышли из системы") с пустыми токенами в Cookies и заголовке"
// @Header 200 {string} Authorization "Bearer <AccessJWTToken>"
// @Cookie 200 {string} refresh_token "Refresh JWT Token"
// @Failure 400 {string} string "Invalid request method"
// @Failure 500 {string} string "Answer error"
// @Router /logout [GET]
func logOutHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Недопустимый метод запроса", http.StatusMethodNotAllowed)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		Secure:   true,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Authorization", "")

	err := json.NewEncoder(w).Encode(map[string]string{
		"message": "Вы успешно вышли из системы",
	})
	if err != nil {
		http.Error(w, "answer error: "+err.Error(), http.StatusInternalServerError)
		return
	}
}
