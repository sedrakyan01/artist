package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/redis/go-redis/v9"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// @Summary Добавление трека в плейлист
// @Description Этот эндпоинт позволяет добавить трек в плейлист при наличии токенов, trackID и названия плейлиста
// @Tags playlist
// @Produce text/plain
// @Param Authorization header string true "Access token (format: 'Bearer {token}') из header"
// @Param refresh_token header string true "Refresh token из cookies"
// @Param trackID query int true "ID добавляемого трека"
// @Param playlistName query string true "Название плейлиста, в который добавляется трек"
// @Success 200 {string} string "Success message"
// @Failure 400 {string} string "Bad Request"
// @Failure 405 {string} string "Method Not Allowed"
// @Router /addtoplaylist [post]
// @Security CookieAuth
// @Security BearerAuth
func addToPlaylistHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		logger.Println("method not allowed")
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	claims, err := tokensExtractionAndUpdate(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		logger.Println(err)
		return
	}

	trackID := r.URL.Query().Get("trackID")
	playlistName := r.URL.Query().Get("playlistName")

	if trackID == "" || playlistName == "" {
		logger.Println("empty track or playlist name")
		http.Error(w, "empty track or playlist name", http.StatusBadRequest)
		return
	}

	answer, err := addToPlaylist(playlistName, trackID, claims.Username)
	if err != nil {
		logger.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(answer))
}

func addToPlaylist(playlistName, trackID, owner string) (string, error) {

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	exists, err := rdb.Exists(ctx, "playlistMeta:"+playlistName+":"+owner).Result()
	if err != nil {
		return "", fmt.Errorf("error adding the track %s to the playlist %s: %v", trackID, playlistName, err)
	}

	if exists == 0 {
		err2 := rdb.HSet(ctx, "playlistMeta:"+playlistName+":"+owner, map[string]interface{}{
			"name":   playlistName,
			"owner":  owner,
			"access": "private",
			"tracks": 0,
		}).Err()
		if err2 != nil {
			return "", fmt.Errorf("error creating playlist %s: %v", playlistName, err2)
		}

		playlists, err := rdb.HGet(ctx, "User:"+owner, "playlists").Result()
		if err != nil {
			return "", fmt.Errorf("error creating playlist %s: %v", playlistName, err)
		}

		err = rdb.HSet(ctx, "User:"+owner, map[string]interface{}{
			"playlists": playlistName + "," + playlists,
		}).Err()
		if err != nil {
			return "", fmt.Errorf("error creating playlist %s: %v", playlistName, err)
		}
	}

	if exists == 1 {
		ownerMeta, err := rdb.HGet(ctx, "playlistMeta:"+playlistName+":"+owner, "owner").Result()
		if err != nil {
			return "", fmt.Errorf("connection is lost: %v", err)
		}
		if ownerMeta != owner {
			return "", fmt.Errorf("access denied")
		}
	}

	_, err = rdb.LPos(ctx, "playlistTracks:"+playlistName+":"+owner, trackID, redis.LPosArgs{}).Result()
	if err == nil {
		return "", fmt.Errorf("track %s is already in the playlist %s", trackID, playlistName)
	}

	if !errors.Is(err, redis.Nil) {
		return "", fmt.Errorf("connection is lost: %v", err)
	} else {
		//увеличиваем количество треков в мета плейлиста
		playlistKey := "playlistMeta:" + playlistName + ":" + owner

		err = rdb.HIncrBy(ctx, playlistKey, "tracks", 1).Err()
		if err != nil {
			return "", fmt.Errorf("failed to increment track count: %v", err)
		}
		//добавляем трек в список треков плейлиста
		err = rdb.LPush(ctx, "playlistTracks:"+playlistName+":"+owner, trackID).Err()
		if err != nil {
			return "", fmt.Errorf("error adding track %s to playlist %s: %v\n", trackID, playlistName, err)
		}
	}
	return fmt.Sprintf("The track %s has been successfully added to playlist %s", trackID, playlistName), nil
}

// @Summary Удаление трека из плейлиста
// @Description Этот эндпоинт позволяет удалить трек из плейлиста при наличии токенов, trackID и названия плейлиста
// @Tags playlist
// @Produce text/plain
// @Param Authorization header string true "Access token (format: 'Bearer {token}') из header"
// @Param refresh_token header string true "Refresh token из cookies"
// @Param trackID query int true "ID удаляемого трека"
// @Param playlistName query string true "Название плейлиста, из которого удаляется трек"
// @Success 200 {string} string "Success message"
// @Failure 400 {string} string "Bad Request"
// @Failure 405 {string} string "Method Not Allowed"
// @Router /deletefromplaylist [delete]
// @Security CookieAuth
// @Security BearerAuth
func deleteFromPlaylistHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		logger.Println("method not allowed")
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	claims, err := tokensExtractionAndUpdate(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		logger.Println(err)
		return
	}

	trackID := r.URL.Query().Get("trackID")
	playlistName := r.URL.Query().Get("playlistName")

	if trackID == "" || playlistName == "" {
		logger.Println("empty track or playlist name")
		http.Error(w, "empty track or playlist name", http.StatusBadRequest)
		return
	}

	result, err := deleteFromPlaylist(playlistName, trackID, claims.Username)
	if err != nil {
		logger.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(result))
}

func deleteFromPlaylist(playlistName, trackID, owner string) (string, error) {
	err := playlistOwnerCheck(playlistName, owner)
	if err != nil {
		return "", err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	deleted, err := rdb.LRem(ctx, "playlistTracks:"+playlistName+":"+owner, 0, trackID).Result()
	if err != nil {
		return "", fmt.Errorf("error deleting track %s from playlist %s: %v", trackID, playlistName, err)
	}

	if deleted == 0 {
		return "", fmt.Errorf("track %s from playlist %s hasn't been found", trackID, playlistName)
	}

	//уменьшаем количество треков в мета плейлиста
	playlistKey := "playlistMeta:" + playlistName + ":" + owner

	amount, err := rdb.HIncrBy(ctx, playlistKey, "tracks", -1).Result()
	if err != nil {
		return "", fmt.Errorf("failed to decrement track count: %v", err)
	}

	if amount < 1 {
		_, err = deletePlaylist(playlistName, owner)
		if err != nil {
			return "", fmt.Errorf("failed to delete playlist: %v", err)
		}
	}

	return fmt.Sprintf("The track %s has been deleted from playlist %s", trackID, playlistName), nil
}

// @Summary Удаление плейлиста
// @Description Этот эндпоинт позволяет удалить плейлист при наличии токенов и названия плейлиста
// @Tags playlist
// @Produce text/plain
// @Param Authorization header string true "Access token (format: 'Bearer {token}') из header"
// @Param refresh_token header string true "Refresh token из cookies"
// @Param playlistName query string true "Название удаляемого плейлиста"
// @Success 200 {string} string "Success message"
// @Failure 400 {string} string "Bad Request"
// @Failure 405 {string} string "Method Not Allowed"
// @Router /deleteplaylist [delete]
// @Security CookieAuth
// @Security BearerAuth
func deletePlaylistHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		logger.Println("method not allowed")
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	claims, err := tokensExtractionAndUpdate(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		logger.Println(err)
		return
	}

	playlistName := r.URL.Query().Get("playlistName")

	if playlistName == "" {
		logger.Println("empty track or playlist name")
		http.Error(w, "empty track or playlist name", http.StatusBadRequest)
		return
	}

	answer, err := deletePlaylist(playlistName, claims.Username)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		logger.Println(err)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(answer))
}

func deletePlaylist(playlistName, owner string) (string, error) {
	err := playlistOwnerCheck(playlistName, owner)
	if err != nil {
		return "", err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	playlistsString, err := rdb.HGet(ctx, "User:"+owner, "playlists").Result()
	if err != nil || len(playlistsString) < 1 {
		return "", fmt.Errorf("error getting playlists for user %s: %v", owner, err)
	}

	playlistsStringNew := strings.ReplaceAll(playlistsString, playlistName+",", "")
	//playlistsStringNew = strings.ReplaceAll(playlistsStringNew, ",,", ",")

	err = rdb.HSet(ctx, "User:"+owner, "playlists", playlistsStringNew).Err()
	if err != nil {
		return "", fmt.Errorf("error updating playlist %s to playlist %s: %v", playlistName, playlistName, err)
	}

	err = rdb.Del(ctx, "playlistMeta:"+playlistName+":"+owner).Err()
	if err != nil {
		return "", fmt.Errorf("error deleting tracks from playlist %s: %v", playlistName, err)
	}

	err = rdb.Del(ctx, "playlistTracks:"+playlistName+":"+owner).Err()
	if err != nil {
		return "", fmt.Errorf("error deleting playlist %s: %v", playlistName, err)
	}

	return fmt.Sprintf("The playlist %s has been deleted successfully", playlistName), nil
}

// @Summary Изменение статуса плейлиста
// @Description Этот эндпоинт позволяет изменить статус плейлиста при наличии токенов и названия плейлиста
// @Tags playlist
// @Produce text/plain
// @Param Authorization header string true "Access token (format: 'Bearer {token}') из header"
// @Param refresh_token header string true "Refresh token из cookies"
// @Param playlistName query string true "Название плейлиста"
// @Success 200 {string} string "Success message"
// @Failure 400 {string} string "Bad Request"
// @Failure 405 {string} string "Method Not Allowed"
// @Router /playlistchangestatus [post]
// @Security CookieAuth
// @Security BearerAuth
func playlistChangeAccessHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		logger.Println("method not allowed")
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	claims, err := tokensExtractionAndUpdate(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		logger.Println(err)
		return
	}

	playlistName := r.URL.Query().Get("playlistName")

	if playlistName == "" {
		logger.Println("empty track or playlist name")
		http.Error(w, "empty track or playlist name", http.StatusBadRequest)
		return
	}

	answer, err := playlistChangeAccess(playlistName, claims.Username)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		logger.Println(err)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(answer))
}

func playlistChangeAccess(playlistName, owner string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	err := playlistOwnerCheck(playlistName, owner)
	if err != nil {
		return "", err
	}

	exists, err := rdb.Exists(ctx, "playlistMeta:"+playlistName+":"+owner).Result()
	if err != nil {
		return "", fmt.Errorf("error checking if playlistMeta exists for playlist %s: %v", playlistName, err)
	}

	if exists == 0 {
		return "", fmt.Errorf("playlist %s does not exist", playlistName)
	}

	access, err := rdb.HGet(ctx, "playlistMeta:"+playlistName+":"+owner, "access").Result()
	if err != nil {
		return "", fmt.Errorf("error changing playlist %s status: %v", playlistName, err)
	}

	newAccess := ""

	switch access {
	case "private":
		newAccess = "public"
	case "public":
		newAccess = "private"
	default:
		return "", fmt.Errorf("error changing playlist %s status", playlistName)
	}

	err = rdb.HSet(ctx, "playlistMeta:"+playlistName+":"+owner, "access", newAccess).Err()
	if err != nil {
		return "", fmt.Errorf("error changing playlist %s status: %v", playlistName, err)
	}

	if newAccess == "public" {
		err = rdb.LPush(ctx, "publicPlaylists", playlistName+":"+owner).Err()
		if err != nil {
			return "", fmt.Errorf("error changing playlist %s status: %v", playlistName, err)
		}
	}

	if newAccess == "private" {
		err = rdb.LRem(ctx, "publicPlaylists", 0, playlistName+":"+owner).Err()
		if err != nil {
			return "", fmt.Errorf("error changing playlist %s status: %v", playlistName, err)
		}
	}

	return fmt.Sprintf("The playlist %s status has been changed to %s", playlistName, newAccess), nil
}

// @Summary Получение плейлистов пользователя
// @Description Этот эндпоинт позволяет получить плейлисты пользователя при наличии токенов
// @Tags playlist
// @Produce application/json
// @Param Authorization header string true "Access token (format: 'Bearer {token}') из header"
// @Param refresh_token header string true "Refresh token из cookies"
// @Success 200 {string} string "Success message"
// @Failure 400 {string} string "Bad Request"
// @Failure 405 {string} string "Method Not Allowed"
// @Router /getuserplaylists [get]
// @Security CookieAuth
// @Security BearerAuth
func getUserPlaylistsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		logger.Println("method not allowed")
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	claims, err := tokensExtractionAndUpdate(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		logger.Println(err)
		return
	}

	playlistsStringSlice, err := getUserPlaylists(claims.Username)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		logger.Println(err)
		return
	}

	playlistsWithMeta, err := getPlaylistFullMeta(claims.Username, playlistsStringSlice)
	if err != nil {
		http.Error(w, "Error getting playlists", http.StatusBadRequest)
		logger.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(playlistsWithMeta)
	if err != nil {
		http.Error(w, "Error", http.StatusBadRequest)
		logger.Println(err)
		return
	}
}

type PlaylistStruct struct {
	Name   string `json:"name"`
	Owner  string `json:"owner"`
	Tracks int    `json:"tracks"`
	Status string `json:"status"`
}

func getPlaylistFullMeta(owner string, playlistsList []string) ([]PlaylistStruct, error) {

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	pipe := rdb.Pipeline()

	var playlistsFullMeta []PlaylistStruct
	results := make([]*redis.MapStringStringCmd, len(playlistsList))

	for i, playlistName := range playlistsList {
		key := "playlistMeta:" + playlistName + ":" + owner
		results[i] = pipe.HGetAll(ctx, key)
	}

	_, err := pipe.Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("error getting playlists: %v", err)
	}

	for _, v := range results {
		playlistMeta, err := v.Result()
		if err != nil && !errors.Is(err, redis.Nil) {
			return nil, fmt.Errorf("error getting playlists: %v", err)
		}

		tracks, exists := playlistMeta["tracks"]
		if !exists {
			return nil, fmt.Errorf("missing 'tracks' field")
		}

		tracksInt, err := strconv.Atoi(tracks)
		if err != nil {
			return nil, fmt.Errorf("error getting playlists: %v", err)
		}

		name, exists := playlistMeta["name"]
		if !exists {
			return nil, fmt.Errorf("missing 'tracks' field")
		}

		access, exists := playlistMeta["access"]
		if !exists {
			return nil, fmt.Errorf("missing 'access' field")
		}

		playlistsFullMeta = append(playlistsFullMeta, PlaylistStruct{
			Name:   name,
			Owner:  owner,
			Tracks: tracksInt,
			Status: access,
		})
	}
	return playlistsFullMeta, nil
}

func getUserPlaylists(username string) ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	playlistsString, err := rdb.HGet(ctx, "User:"+username, "playlists").Result()
	if err != nil {
		return nil, fmt.Errorf("error getting playlists for user %s: %v", username, err)
	}

	if len(playlistsString) < 1 {
		return []string{}, nil
	}

	playlistsSlice := strings.Split(playlistsString[:len(playlistsString)-1], ",")

	return playlistsSlice, nil
}

// @Summary Получение публичных плейлистов
// @Description Этот эндпоинт позволяет получить публичные плейлисты
// @Tags playlist
// @Produce application/json
// @Param start query string true "Стартовый номер получения плейлистов"
// @Param end query string true "Конечный номер получения плейлистов"
// @Success 200 {array} string "Playlists"
// @Failure 400 {string} string "Bad Request"
// @Failure 405 {string} string "Method Not Allowed"
// @Failure 500 {string} string "Internal Server Error"
// @Router /getpublicplaylists [get]
func getPublicPlaylistsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		logger.Println("method not allowed")
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	start := r.URL.Query().Get("start")
	end := r.URL.Query().Get("end")

	if start == "" || end == "" {
		logger.Println("wrong request")
		http.Error(w, "wrong request", http.StatusBadRequest)
		return
	}

	publicPlaylists, err := getPublicPlaylists(start, end)
	if err != nil {
		logger.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	publicPlaylistsClean := make([]string, 0, len(publicPlaylists))
	publicPlaylistsOwners := make([]string, 0, len(publicPlaylists))

	for _, v := range publicPlaylists {
		pos := strings.Index(v, ":")
		publicPlaylistsClean = append(publicPlaylistsClean, v[:pos])
		publicPlaylistsOwners = append(publicPlaylistsOwners, v[pos+1:])
	}

	publicPlaylistsReady := make([]PlaylistStruct, 0, len(publicPlaylists))

	for i := 0; i < len(publicPlaylists); i++ {
		tempSlice := []string{publicPlaylistsClean[i]}
		playlistMeta, err := getPlaylistFullMeta(publicPlaylistsOwners[i], tempSlice)
		if err != nil {
			http.Error(w, "Error getting playlists", http.StatusBadRequest)
			logger.Println(err)
			return
		}

		publicPlaylistsReady = append(publicPlaylistsReady, playlistMeta[0])
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(publicPlaylistsReady)
	if err != nil {
		http.Error(w, "Error", http.StatusBadRequest)
		logger.Println(err)
		return
	}
}

func getPublicPlaylists(start, end string) ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	startInt, _ := strconv.Atoi(start)
	endInt, _ := strconv.Atoi(end)

	publicPlaylists, err := rdb.LRange(ctx, "publicPlaylists", int64(startInt), int64(endInt)).Result()
	if err != nil {
		return nil, fmt.Errorf("error getting public playlists: %v", err)
	}

	return publicPlaylists, nil
}

// @Summary Получение треков из плейлистов
// @Description Этот эндпоинт позволяет получить треки как из публичного плейлиста, так и из личного, сначала проверяется наличие плейлиста в списке публичных, есть он там есть, то токены не нужны, если его там нет, начинается проверка токенов и получение треков из личного плейлиста
// @Tags playlist
// @Produce application/json
// @Param Authorization header string true "Access token (format: 'Bearer {token}') из header"
// @Param refresh_token header string true "Refresh token из cookies"
// @Param playlistName query string true "Название плейлиста"
// @Param start query string true "Стартовый номер получения плейлистов"
// @Param end query string true "Конечный номер получения плейлистов"
// @Success 200 {array} TrackMeta "Метаданные треков"
// @Failure 400 {string} string "Bad Request"
// @Failure 405 {string} string "Method Not Allowed"
// @Failure 500 {string} string "Internal Server Error"
// @Router /gettracksfromplaylist [get]
// @Security CookieAuth
// @Security BearerAuth
func getTracksFromPlaylistHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		logger.Println("method not allowed")
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	playlistName := r.URL.Query().Get("playlistName")
	start := r.URL.Query().Get("start")
	end := r.URL.Query().Get("end")

	if start == "" || end == "" || playlistName == "" {
		logger.Println("wrong request")
		http.Error(w, "wrong request", http.StatusBadRequest)
		return
	}

	startInt, err := strconv.Atoi(start)
	if err != nil {
		logger.Println(err)
		http.Error(w, "wrong request", http.StatusBadRequest)
		return
	}
	endInt, err := strconv.Atoi(end)
	if err != nil {
		logger.Println(err)
		http.Error(w, "wrong request", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	_, err = rdb.LPos(ctx, "publicPlaylists", playlistName, redis.LPosArgs{}).Result()
	if errors.Is(err, redis.Nil) {
		claims, err := tokensExtractionAndUpdate(w, r)
		if err != nil {
			logger.Println(err.Error())
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		owner := claims.Username

		tracks, err := getTracksFromPlaylistPrivate(startInt, endInt, playlistName, owner)
		if err != nil {
			logger.Println(err.Error())
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		trackToSend, err := getMetaTracksFromSlice(tracks)
		if err != nil {
			logger.Println(err.Error())
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Header().Set("Content-Type", "application/json")
		w.Write(trackToSend)

	} else if err != nil {
		logger.Println("data error" + err.Error())
		http.Error(w, "data error"+err.Error(), http.StatusInternalServerError)
		return
	} else {
		tracks, err := getTracksFromPlaylistPublic(startInt, endInt, playlistName)
		if err != nil {
			logger.Println(err.Error())
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		trackToSend, err := getMetaTracksFromSlice(tracks)
		if err != nil {
			logger.Println(err.Error())
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Header().Set("Content-Type", "application/json")
		w.Write(trackToSend)
	}
}

func getTracksFromPlaylistPublic(start, end int, playlistName string) ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	access, err := rdb.HGet(ctx, "playlistMeta:"+playlistName, "access").Result()
	if err != nil {
		return nil, fmt.Errorf("error getting playlist %s data: %v", playlistName, err)
	}

	if access == "private" {
		return nil, fmt.Errorf("access denied")
	}

	tracks, err := rdb.LRange(ctx, "playlistTracks:"+playlistName, int64(start), int64(end)).Result()
	if err != nil {
		return nil, fmt.Errorf("error getting tracks for playlist %s: %v", playlistName, err)
	}

	return tracks, nil
}

func getTracksFromPlaylistPrivate(start, end int, playlistName, owner string) ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	ownerMeta, err := rdb.HGet(ctx, "playlistMeta:"+playlistName+":"+owner, "owner").Result()
	if err != nil {
		return nil, fmt.Errorf("error getting playlist %s data: %v", playlistName, err)
	}

	if ownerMeta != owner {
		return nil, fmt.Errorf("access denied")
	}

	tracks, err := rdb.LRange(ctx, "playlistTracks:"+playlistName+":"+owner, int64(start), int64(end)).Result()
	if err != nil {
		return nil, fmt.Errorf("error getting tracks for playlist %s: %v", playlistName, err)
	}

	return tracks, nil
}

func playlistOwnerCheck(playlistName, owner string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	metaOwner, err := rdb.HGet(ctx, "playlistMeta:"+playlistName+":"+owner, "owner").Result()

	if err != nil {
		if errors.Is(err, redis.Nil) {
			return fmt.Errorf("playlist %s does not exists", playlistName)
		}
		return fmt.Errorf("error getting meta for playlist %s: %v", playlistName, err)
	}

	if metaOwner != owner {
		return fmt.Errorf("access denied")
	}

	return nil
}

/*
func addToPlaylist(ctx context.Context, playlistName, trackID string) error {
	err := rdb.HGet(ctx, "playlist:"+playlistName, "access").Err()
	if errors.Is(err, redis.Nil) {
		err = rdb.HSet(ctx, "playlist:"+playlistName, map[string]interface{}{
			"tracks": trackID + " ",
			"access": "private",
		}).Err()
	} else if err != nil {
		return fmt.Errorf("redis connection error: %v", err)
	} else {
		tracks, err := rdb.HGet(ctx, "playlist:"+playlistName, "tracks").Result()
		if err != nil {
			return fmt.Errorf("redis connection error: %v", err)
		}

		err = rdb.HSet(ctx, "playlist:"+playlistName, map[string]interface{}{
			"tracks": tracks + trackID + " ",
		}).Err()
		if err != nil {
			return fmt.Errorf("redis connection error: %v", err)
		}
	}

	return nil
}*/
