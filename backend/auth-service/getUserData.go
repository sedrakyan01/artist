package main

import (
	"context"
	"encoding/json"
	"net/http"
	"time"
)

// getUserDataHandler Получение данных пользователя
// @Summary Получение данных пользователя
// @Description Получение данных пользователя из Redis по Username, находящемуся в access токене
// @Tags user
// @Produce application/json
// @Param Authorization header string true "Access token (format: 'Bearer {token}') из header"
// @Param refresh_token header string true "Refresh token из cookies"
// @Success 200 {array} string
// @Failure 401 {string} string "Unauthorized - Invalid or expired token"
// @Failure 405 {string} string "Method Not Allowed"
// @Failure 500 {string} string "Getting user data error, encoding user data error"
// @Router /getuserdatasend [GET]
// @Security CookieAuth
// @Security BearerAuth
func getUserDataHandler(w http.ResponseWriter, r *http.Request) {

	claims, err := tokensExtractionAndUpdate(w, r)
	if err != nil {
		http.Error(w, "Invalid or expired token: "+err.Error(), http.StatusUnauthorized)
		return
	}

	username := claims.Username

	/*старая версия получения данных пользователя с бд
	query := `SELECT user_name, first_name, artist_name, email, country, birth_date FROM users WHERE user_name = $1`

	err = DB.QueryRow(query, userName).Scan(&userData.Username, &userData.FirstName, &userData.ArtistName, &userData.Email, &userData.Country, &userData.BirthDate)
	if err != nil {
		http.Error(w, "Getting user data error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	*/

	var fields []string

	err = json.NewDecoder(r.Body).Decode(&fields)
	if err != nil {
		logger.Printf("decoding user data error: %s", err.Error())
		http.Error(w, "error getting data", http.StatusInternalServerError)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	userData, err := rdb.HMGet(ctx, "User:"+username, fields...).Result()
	if err != nil {
		logger.Printf("encoding user data error: %s", err.Error())
		http.Error(w, "error getting data", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	err = json.NewEncoder(w).Encode(userData)
	if err != nil {
		logger.Printf("encoding user data error: %s", err.Error())
		http.Error(w, "error getting data", http.StatusInternalServerError)
		return
	}
}
