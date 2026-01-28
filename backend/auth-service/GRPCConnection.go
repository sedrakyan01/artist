package main

import (
	"aiartistprod/backend/auth-service/Kafka"
	"aiartistprod/backend/auth-service/proto-gen-files"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/protobuf/types/known/timestamppb"
	"io"
	"math/rand"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
)

const (
	maxUploadSize  = 12 << 20 // 12MB (общий лимит формы)
	maxMusicSize   = 10 << 20 // 10MB (музыкальный файл)
	maxPictureSize = 2 << 20  // 2MB (изображение)
)

var musicClient gen.MusicServiceClient

// TrackMeta структура метаданных пользователя
type TrackMeta struct {
	ArtistName string `json:"artist_name"`
	Title      string `json:"title"`
	AlbumName  string `json:"album_name"`
	Genre      string `json:"genre"`
	// Описание песни - необязательное поле
	Description string `json:"description"`
	// Длительность песни - не отправлять
	Duration    int `json:"duration"`
	ReleaseYear int `json:"release_year"`
	// Дата добавления в БД - не отправлять
	AddToDbDate string `json:"add_to_db_date"`
	// Владелец песни - не отправлять
	Owner string `json:"owner"`
	// Количество лайков - не отправлять
	Likes int `json:"likes"`
	// Количество прослушиваний - не отправлять
	Plays        int    `json:"plays"`
	TrackPicture []byte `json:"track_picture"`
	TrackID      int    `json:"track_id"`
}

type Artists struct {
	Name  string  `json:"name"`
	Plays float64 `json:"plays"`
}

type ResponseMainPage struct {
	Artists []Artists              `json:"artists"`
	Tracks  map[string][]TrackMeta `json:"tracks"`
}

func initGRPCClient() {
	conn, err := grpc.NewClient("localhost:8081", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		logger.Fatalf("ошибка подключения к GRPC серверу: %v", err)
	}
	musicClient = gen.NewMusicServiceClient(conn)
}

func mainPage(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	/*musicStyles := []string{"acoustic", "afrobeat", "alternative", "ambient", "bluegrass", "blues", "chillout",
	"classical", "country", "disco", "drum and bass", "dubstep", "edm", "electronic",
	"experimental", "folk", "funk", "gospel", "grunge", "hard rock", "hip-hop", "house",
	"indie", "industrial", "jazz", "k-pop", "latin", "lo-fi", "metal", "new wave", "opera",
	"phonk", "pop", "progressive rock", "punk", "r&b", "rap", "reggae", "rock", "soul", "soundtrack", "synthwave", "techno", "trance"}*/

	randomMusicStyles := []string{"alternative", "edm", "hard rock", "hip-hop", "phonk", "pop", "rap", "rock", "synthwave", "techno", "trance"}

	rand.NewSource(time.Now().UnixNano())
	randSlice := rand.Perm(len(randomMusicStyles))

	randomMusicStylesReady := make([]string, 0, 6)

	metaDataGenres := make(map[string][]TrackMeta)

	nmbrSndTrcks := 6
	for i := 0; i < 6; i++ {
		randomMusicStylesReady = append(randomMusicStylesReady, randomMusicStyles[randSlice[i]])
	}

	for i := 0; i < len(randomMusicStylesReady); i++ {
		tracksIDs, err := getTracksFromList(ctx, randomMusicStylesReady[i])
		if err != nil {
			logger.Println(err.Error())
			http.Error(w, "Ошибка загрузки страницы", http.StatusInternalServerError)
			return
		}

		for j := 0; j < len(tracksIDs); j++ {
			trackIDString := strings.TrimPrefix(tracksIDs[j], "track")
			trackID, err := strconv.Atoi(trackIDString)
			if err != nil {
				logger.Println(err.Error())
				http.Error(w, "Ошибка загрузки страницы", http.StatusInternalServerError)
				return
			}

			trackMetaData, err := getTrackMetaFunc(ctx, trackID)
			if err != nil {
				logger.Println(err.Error())
				http.Error(w, "Ошибка загрузки страницы", http.StatusInternalServerError)
				return
			}

			metaDataGenres[randomMusicStylesReady[i]] = append(metaDataGenres[randomMusicStylesReady[i]], *trackMetaData)

			if j == len(tracksIDs)-1 {
				sort.Slice(metaDataGenres[randomMusicStylesReady[i]], func(a, b int) bool {
					return metaDataGenres[randomMusicStylesReady[i]][a].Plays > metaDataGenres[randomMusicStylesReady[i]][b].Plays
				})
				if len(metaDataGenres[randomMusicStylesReady[i]]) > nmbrSndTrcks {
					metaDataGenres[randomMusicStylesReady[i]] = metaDataGenres[randomMusicStylesReady[i]][:nmbrSndTrcks]
				}
			}
		}
	}
	/////////////////
	newTracksIDs, err := getTracksFromList(ctx, "newTracks")
	if err != nil {
		logger.Println(err.Error())
		http.Error(w, "Ошибка загрузки страницы", http.StatusInternalServerError)
	}

	for i := 0; i < 6; i++ {
		newTrackIDString := strings.TrimPrefix(newTracksIDs[i], "track")
		trackID, err := strconv.Atoi(newTrackIDString)
		if err != nil {
			logger.Println(err.Error())
			http.Error(w, "Ошибка загрузки страницы", http.StatusInternalServerError)
			return
		}
		newTrackMeta, err := getTrackMetaFunc(ctx, trackID)
		fmt.Println(trackID)
		if err != nil {
			logger.Println(err.Error())
			http.Error(w, "Ошибка загрузки страницы", http.StatusInternalServerError)
			return
		}

		metaDataGenres["newTracks"] = append(metaDataGenres["newTracks"], *newTrackMeta)
	}
	//////////////
	popularTracksIDs, _, err := getTrackFromZset(ctx, "plays", "")
	if err != nil {
		logger.Println(err.Error())
		http.Error(w, "Ошибка загрузки страницы", http.StatusInternalServerError)
		return
	}

	for i := 0; i < 6; i++ {
		popularTrackIDString := strings.TrimPrefix(popularTracksIDs[i], "track")
		popularTrackID, err := strconv.Atoi(popularTrackIDString)
		if err != nil {
			logger.Println(err.Error())
			http.Error(w, "Ошибка загрузки страницы", http.StatusInternalServerError)
			return
		}

		popularTrackMeta, err := getTrackMetaFunc(ctx, popularTrackID)
		if err != nil {
			logger.Println(err.Error())
			http.Error(w, "Ошибка загрузки страницы", http.StatusInternalServerError)
			return
		}

		metaDataGenres["popularTracks"] = append(metaDataGenres["popularTracks"], *popularTrackMeta)
	}
	//////////////////реализуем получение исполнителей
	_, popularArtistsZ, err := getTrackFromZset(ctx, "Users", "1")

	popularArtists := make([]Artists, 0, 6)
	for _, v := range popularArtistsZ {
		switch member := v.Member.(type) {
		case string:
			artist := Artists{
				Name:  member,
				Plays: v.Score,
			}
			popularArtists = append(popularArtists, artist)
		case []byte:
			artist := Artists{
				Name:  string(member),
				Plays: v.Score,
			}
			popularArtists = append(popularArtists, artist)
		}
	}
	fmt.Println(popularArtists)
	//////////////////
	responseStruct := &ResponseMainPage{
		Artists: popularArtists,
		Tracks:  metaDataGenres,
	}
	w.Header().Set("Content-Type", "application/json")

	err = json.NewEncoder(w).Encode(responseStruct)
	if err != nil {
		logger.Println("error sending genre meta data: " + err.Error())
		http.Error(w, "Ошибка загрузки страницы", http.StatusInternalServerError)
	}
}

func getTrackFromZset(ctx context.Context, key, option string) ([]string, []redis.Z, error) {

	if option == "" {
		tracksIDs, err := rdb.ZRevRange(ctx, key, 0, 5).Result()
		if err != nil {
			logger.Println("error getting tracks IDs" + err.Error())
			return nil, nil, fmt.Errorf("error getting tracks IDs: %s", err)
		}

		return tracksIDs, nil, nil
	} else {
		var err error
		tracksIDsWithScores, err := rdb.ZRevRangeWithScores(ctx, key, 0, 5).Result()
		if err != nil {
			logger.Println("error getting tracks IDs" + err.Error())
			return nil, nil, fmt.Errorf("error getting tracks IDs: %s", err)
		}

		return nil, tracksIDsWithScores, nil
	}
}

func getTracksFromList(ctx context.Context, key string) ([]string, error) {
	var limit int64 = 50

	if key == "newTracks" {
		limit = 6
	}
	tracksIDs, err := rdb.LRange(ctx, key, 0, limit).Result()
	if err != nil {
		logger.Printf("error getting trackID for key %v", err)
		return nil, fmt.Errorf("error getting trackID for key %v", err)
	}

	return tracksIDs, nil
}

// uploadMusicHandler Загружает трек и его метаданные в БД
// @Summary Загружает трек и его метаданные в БД (отправка данных со страницы /uploadmusic)
// @Description Принимает от клиента трек и метаданные трека и отправляет через GRPC в БД
// @Tags track
// @Accept multipart/form-data
// @Produce text/plain
// @Param Authorization header string true "Access token (format: 'Bearer {token}') из header"
// @Param refresh_token header string true "Refresh token из cookies"
// @Param picture_file formData file true "Track cover image, тип multipart/form-data"
// @Param track_file formData file true "Track audio file, тип multipart/form-data"
// @Param meta_data formData string true "Метадата трека согласно TrackMeta структуры in JSON format, тип multipart/form-data"
// @Success 200 {string} string "Your track has been uploaded successfully"
// @Failure 400 {string} string "Bad Request - Invalid input, missing required data, file too large, file type error, or metadata retrieval error"
// @Failure 401 {string} string "Unauthorized - Invalid or expired token"
// @Failure 405 {string} string "Method Not Allowed - Use POST"
// @Failure 415 {string} string "Unsupported Media Type - Must be multipart/form-data"
// @Failure 413 {string} string "Request Entity Too Large - Exceeds file size limit"
// @Failure 500 {string} string "Internal Server Error - Unexpected issue"
// @Router /uploadmusicsend [post]
// @Security CookieAuth
// @Security BearerAuth
func uploadMusicHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Недопустимый метод запроса", http.StatusMethodNotAllowed)
		return
	}

	claims, err := tokensExtractionAndUpdate(w, r)
	if err != nil {
		http.Error(w, "Авторизуйтесь: "+err.Error(), http.StatusBadRequest)
		logger.Println("Авторизуйтесь снова:", err)
		return
	}

	contentType := r.Header.Get("Content-Type")
	if contentType == "" || !strings.HasPrefix(contentType, "multipart/form-data") {
		http.Error(w, "Отсутствует заголовок multipart/form-data", http.StatusUnsupportedMediaType)
		return
	}

	err = r.ParseMultipartForm(maxUploadSize)
	if err != nil {
		logger.Println("The body of upload music request is too large:", err)
		http.Error(w, "The body of upload music request is too large", http.StatusBadRequest)
		return
	}

	musicFile, musicHeader, err := r.FormFile("track_file")
	if err != nil {
		logger.Println("Error getting music file after parsing:", err)
		http.Error(w, "Error getting music file after parsing", http.StatusBadRequest)
		return
	}
	defer musicFile.Close()

	if musicHeader.Size > maxMusicSize {
		logger.Println("Music file is too large")
		http.Error(w, "Music file is too large", http.StatusBadRequest)
		return
	}

	pictureFile, pictureHeader, err := r.FormFile("picture_file")
	if err != nil {
		logger.Println("Error getting picture file after parsing:", err)
		http.Error(w, "Error getting picture file after parsing", http.StatusBadRequest)
		return
	}
	defer pictureFile.Close()

	if pictureHeader.Size > maxPictureSize {
		logger.Println("Picture file is too large")
		http.Error(w, "Picture file is too large", http.StatusBadRequest)
		return
	}

	musicFileData, err := io.ReadAll(musicFile)
	if err != nil {
		http.Error(w, "Ошибка чтения файла", http.StatusInternalServerError)
		return
	}

	if !strings.HasSuffix(musicHeader.Filename, ".mp3") &&
		!strings.HasSuffix(musicHeader.Filename, ".MP3") {
		http.Error(w, "File type error", http.StatusBadRequest)
		return
	}

	pictureFileData, err := io.ReadAll(pictureFile)
	if err != nil {
		http.Error(w, "Ошибка чтения файла", http.StatusInternalServerError)
		return
	}

	if !strings.HasSuffix(pictureHeader.Filename, ".jpeg") &&
		!strings.HasSuffix(pictureHeader.Filename, ".jpg") {
		http.Error(w, "File type error", http.StatusBadRequest)
		return
	}

	currentTime := timestamppb.New(time.Now())

	trackMeta := &TrackMeta{}

	metaData := r.FormValue("meta_data")
	if metaData == "" {
		http.Error(w, "Getting metaData error", http.StatusBadRequest)
		return
	}

	err = json.Unmarshal([]byte(metaData), &trackMeta)
	if err != nil {
		http.Error(w, "Getting metaData error", http.StatusBadRequest)
		return
	}

	fmt.Println(trackMeta)
	// тут реализовать добавку метаданных
	_, err = musicClient.UploadMusic(context.Background(), &gen.UploadMusicRequest{
		ArtistName:   trackMeta.ArtistName,
		Title:        trackMeta.Title,
		AlbumName:    trackMeta.AlbumName,
		Genre:        trackMeta.Genre,
		Description:  trackMeta.Description,
		Duration:     0,
		ReleaseYear:  int32(trackMeta.ReleaseYear),
		AddToDbDate:  currentTime,
		TrackPicture: pictureFileData,
		MusicContent: musicFileData,
		Owner:        claims.Username,
	})
	if err != nil {
		http.Error(w, "Failed to upload music: "+err.Error(), http.StatusInternalServerError)
		return
	}
	/////вызов кафка пользователь добавил трек
	msgText := fmt.Sprintf("Artist %s has uploaded track %s", trackMeta.ArtistName, trackMeta.Title)

	_, err = Kafka.SendMsg(producer, "users_events", msgText, logger)
	if err != nil {
		logger.Println("Failed to send message to Kafka:", err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Your track has been uploaded successfully"))
}

// streamMusicHandler Выполняет потоковый стриминг трека из GRPC клиенту
// @Summary Выполняет потоковый стриминг трека из GRPC клиенту (отправка данных со страницы /streammusic)
// @Description Принимает от клиента имя исполнителя, название трека и стартовую позицию воспроизведения и по этим данным начинает воспроизведение
// @Tags track
// @Accept text/plain
// @Produce application/octet-stream
// @Param artist_name query string true "Имя артиста"
// @Param title query string true "Название трека"
// @Param startPosition query int true "Стартовая позиция воспроизведения в секундах"
// @Success 200 {array} []byte "Audio stream, поток []byte данных трека"
// @Failure 500 {string} string "Internal Server Error: invalid startPosition, streaming music error, error getting metadata, error streaming music"
// @Router /streammusicsend [GET]
func streamMusicHandler(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	trackID := r.URL.Query().Get("trackID")
	startPosition := r.URL.Query().Get("startPosition")
	startPosition = strings.TrimSpace(startPosition)

	startPositionInt, err := strconv.Atoi(startPosition)
	if err != nil {
		http.Error(w, "Invalid startPosition: "+err.Error(), http.StatusInternalServerError)
		return
	}

	stream, err := musicClient.StreamMusic(context.Background(), &gen.StreamMusicRequest{
		Username:      username,
		TrackId:       trackID,
		StartPosition: int64(startPositionInt),
	})
	if err != nil {
		http.Error(w, "Streaming music error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	md, err := stream.Header()
	if err != nil {
		http.Error(w, "Error getting metadata", http.StatusInternalServerError)
		logger.Println("Error getting metadata:", err)
		return
	}

	musicDuration := md.Get("music-duration")
	if len(musicDuration) > 0 {
		logger.Println("music-duration received", musicDuration)
		w.Header().Set("Music-Duration", musicDuration[0])
	} else {
		logger.Println("music-duration metadata not found")
	}

	upgradeToWebsocket := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}

	conn, err := upgradeToWebsocket.Upgrade(w, r, nil)
	if err != nil {
		logger.Printf("Websocker connection error: %v\n", err)
		return
	}
	defer conn.Close()

	var firstTime time.Time

	var wg sync.WaitGroup
	wg.Add(1)

	ctx, cancel := context.WithCancel(context.Background())

	go func() {

		firstTime = time.Now()

		for {

			select {
			case <-ctx.Done():
				return
			default:
				resp, err := stream.Recv()
				if err == io.EOF {
					logger.Println("End of streaming file")
					conn.Close()
					cancel()
					return
				}
				if err != nil {
					logger.Printf("Error streaming music: %v\n", err)
					conn.Close()
					cancel()
					return
				}

				err = conn.WriteMessage(websocket.BinaryMessage, resp.Data)
				if err != nil {
					logger.Printf("Ошибка отправки по WebSocket: %v\n", err)
					conn.Close()
					cancel()
					return
				}
			}
		}
	}()

	go func() {
		defer wg.Done()

		for {
			select {
			case <-ctx.Done():
				logger.Println("Received cancel in reading goroutine")
				return
			default:
				//conn.SetReadDeadline(time.Now().Add(1 * time.Second))
				msgType, msg, err := conn.ReadMessage()

				if err != nil {
					/*	var netError net.Error
						if errors.As(err, &netError) && netError.Timeout() {
							logger.Println("End of timeout")
							continue
						}*/

					logger.Printf("Ошибка при чтении из WebSocket: %v\n", err)
					cancel()
					return
				}

				if msgType == websocket.TextMessage {
					if string(msg) == "played_60_sec" {

						secondTime := time.Now()
						timeValue := secondTime.Sub(firstTime)

						if timeValue.Seconds() > 55 {

							firstTime = time.Now()
							playsIncr(username, trackID)
						}
					} else if string(msg) == "finish" {
						cancel()
						return
					}
				}
			}
		}
	}()

	wg.Wait()
}

func playsIncr(username, trackID string) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := rdb.ZIncrBy(ctx, "Users", 1, username).Err()
	if err != nil {
		logger.Println("Ошибка при увеличении прослушивания в sorted set Users")
	}

	err = rdb.HIncrBy(ctx, "User:"+username, "plays", 1).Err()
	if err != nil {
		logger.Println("Ошибка при увеличении прослушивания в хэше")
	}

	err = rdb.ZIncrBy(ctx, "plays", 1, "track"+trackID).Err()
	if err != nil {
		logger.Println("Ошибка при увеличении прослушивания в sorted set likes")
	}

	err = rdb.HIncrBy(ctx, "track"+trackID, "plays", 1).Err()
	if err != nil {
		logger.Println("Ошибка при увеличении прослушивания в хэше track")
	}
}

// getMetaHandler возвращает метаданные трека по его ID
// @Summary Получить метаданные трека (отправка track_id со страницы /gettrackmeta)
// @Description Возвращает информацию о треке по его уникальному идентификатору
// @Tags track
// @Accept json
// @Produce json
// @Param track_id query int true "ID трека"
// @Success 200 {object} TrackMeta
// @Failure 400 {string} string "Bad Request - Empty trackID, trackID error, metadata retrieval error, or trackMeta serialization error"
// @Failure 405 {string} string "Method Not Allowed - Invalid request method"
// @Router /gettrackmetasend [get]
func getMetaHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Недопустимый метод запроса", http.StatusMethodNotAllowed)
		return
	}

	trackIDString := r.URL.Query().Get("track_id")
	if trackIDString == "" {
		logger.Println("Пустой trackID")
		http.Error(w, "Пустой trackID", http.StatusBadRequest)
		return
	}

	trackID, err := strconv.Atoi(trackIDString)
	if err != nil {
		logger.Printf("trackID error: %v\n", err)
		http.Error(w, "trackID error: "+err.Error(), http.StatusBadRequest)
		return
	}

	trackMeta, err := getTrackMetaFunc(r.Context(), trackID)
	if err != nil {
		logger.Printf("getting meta error: %v\n", err)
		http.Error(w, "getting meta error: "+err.Error(), http.StatusBadRequest)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(trackMeta)
	if err != nil {
		logger.Printf("Ошибка сериализации JSON: %v\n", err)
		http.Error(w, "trackMeta serialization error: "+err.Error(), http.StatusInternalServerError)
		return
	}
}

func getTrackMetaFunc(ctx context.Context, trackID int) (*TrackMeta, error) {
	res, err := musicClient.GetMeta(ctx, &gen.GetMetaRequest{TrackId: int32(trackID)})
	if err != nil {
		logger.Printf("getting meta error: %v\n", err)
		return nil, errors.New("getting meta error: " + err.Error())
	}

	addToDBDate := res.AddToDbDate.AsTime().Format(time.RFC3339)

	trackMeta := &TrackMeta{
		ArtistName:   res.ArtistName,
		Title:        res.Title,
		AlbumName:    res.AlbumName,
		Genre:        res.Genre,
		Description:  res.Description,
		Duration:     int(res.Duration),
		ReleaseYear:  int(res.ReleaseYear),
		AddToDbDate:  addToDBDate,
		Owner:        res.Owner,
		Likes:        int(res.Likes),
		Plays:        int(res.Plays),
		TrackPicture: res.TrackPicture,
		TrackID:      int(res.TrackID),
	}

	return trackMeta, nil
}
