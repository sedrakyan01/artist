package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"
)

// @Summary Получение треков пользователя
// @Description Этот эндпоинт позволяет получить треки пользователя при наличии токенов
// @Tags user
// @Produce application/json
// @Param Authorization header string true "Access token (format: 'Bearer {token}') из header"
// @Param refresh_token header string true "Refresh token из cookies"
// @Param start query string true "Стартовый номер получения плейлистов"
// @Param end query string true "Конечный номер получения плейлистов"
// @Success 200 {array} TrackMeta "Метаданные треков"
// @Failure 400 {string} string "Bad Request"
// @Failure 405 {string} string "Method Not Allowed"
// @Failure 500 {string} string "Internal Server Error"
// @Router /getUserTracks [get]
func getUserTracksHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		logger.Println("method not allowed")
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	range1String := r.URL.Query().Get("start")
	range2String := r.URL.Query().Get("end")

	if range1String == "" || range2String == "" {
		logger.Println("range1 and range2 are required")
		http.Error(w, "range1 and range2 are required", http.StatusBadRequest)
		return
	}

	claims, err := tokensExtractionAndUpdate(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		logger.Println(err)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	range1Int, err := strconv.Atoi(range1String)
	if err != nil {
		logger.Println(err)
		http.Error(w, "range1 is invalid", http.StatusBadRequest)
	}

	range2Int, err := strconv.Atoi(range2String)
	if err != nil {
		logger.Println(err)
		http.Error(w, "range2 is invalid", http.StatusBadRequest)
	}

	fmt.Println(claims.Username)

	tracks, err := rdb.LRange(ctx, "UserTracks:"+claims.Username, int64(range1Int), int64(range2Int)).Result()
	if err != nil {
		logger.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	tracksMetaToSendJson, err := getMetaTracksFromSlice(tracks)
	if err != nil {
		logger.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(tracksMetaToSendJson)
}

func getMetaTracksFromSlice(tracks []string) ([]byte, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	tracksMetaToSend := make([]*TrackMeta, 0)

	for _, v := range tracks {
		vInt, err := strconv.Atoi(v)
		if err != nil {
			logger.Println(err)
			return nil, err
		}

		trackMeta, err := getTrackMetaFunc(ctx, vInt)
		if err != nil {
			logger.Println(err)
			return nil, err
		}

		tracksMetaToSend = append(tracksMetaToSend, trackMeta)
	}

	tracksMetaToSendJson, err := json.Marshal(tracksMetaToSend)
	if err != nil {
		logger.Println(err)
		return nil, err
	}

	return tracksMetaToSendJson, nil
}

// @Summary Удаления трека пользователя
// @Description Этот эндпоинт позволяет удалить трек при наличии токенов
// @Tags track
// @Produce text/plain
// @Param Authorization header string true "Access token (format: 'Bearer {token}') из header"
// @Param refresh_token header string true "Refresh token из cookies"
// @Param trackID query string true "ID трека"
// @Param trackOwner query string true "Владелец трека - Username"
// @Param genre query string true "Жанр трека"
// @Success 200 {string} string "The track has been deleted successfully"
// @Failure 400 {string} string "Bad Request"
// @Failure 401 {string} string "Unauthorized"
// @Failure 405 {string} string "Method Not Allowed"
// @Failure 500 {string} string "Internal Server Error"
// @Router /deleteusertrack [delete]
func deleteUserTrackHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		logger.Println("method not allowed")
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	trackOwner := r.URL.Query().Get("trackOwner")
	trackID := r.URL.Query().Get("trackID")
	genre := r.URL.Query().Get("genre")

	if trackID == "" || trackOwner == "" || genre == "" {
		logger.Println("trackID is required")
		http.Error(w, "trackID is required", http.StatusBadRequest)
		return
	}

	claims, err := tokensExtractionAndUpdate(w, r)
	if err != nil {
		logger.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if claims.Username != trackOwner {
		logger.Println("you are not the owner of this track")
		http.Error(w, "you are not the owner of this track", http.StatusUnauthorized)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	trackIDInt, err := strconv.Atoi(trackID)
	if err != nil {
		logger.Println(err)
		http.Error(w, "range1 is invalid", http.StatusBadRequest)
		return
	}

	query := `DELETE FROM trackMeta WHERE id = $1`
	_, err = DB.Exec(query, trackIDInt)
	if err != nil {
		logger.Println(err)
		http.Error(w, "error deleting track"+err.Error(), http.StatusInternalServerError)
		return
	}

	pipe := rdb.TxPipeline()

	pipe.LRem(ctx, "UserTracks:"+claims.Username, 0, trackID)
	pipe.Del(ctx, "track"+trackID)
	pipe.LRem(ctx, "newTracks", 0, "track"+trackID)
	pipe.LRem(ctx, genre, 0, "track"+trackID)
	pipe.ZRem(ctx, "likes", "track"+trackID)
	pipe.ZRem(ctx, "plays", "track"+trackID)

	_, err = pipe.Exec(ctx)
	if err != nil {
		logger.Println(err)
		http.Error(w, "error deleting track"+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/plain")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("The track has been deleted successfully"))
}
