package main

import (
	"aiartistprod/backend/auth-service/Db"
	"aiartistprod/backend/auth-service/Graphql"
	"aiartistprod/backend/auth-service/Kafka"
	_ "aiartistprod/backend/auth-service/docs"
	logger2 "aiartistprod/backend/auth-service/logger"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"github.com/IBM/sarama"
	"github.com/graphql-go/handler"
	_ "github.com/lib/pq"
	redisOrig "github.com/redis/go-redis/v9"
	httpSwagger "github.com/swaggo/http-swagger"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
	"time"
)

// User структура данных пользователя для регистрации
type User struct {
	Username   string `json:"userName"`
	FirstName  string `json:"firstName"`
	ArtistName string `json:"artistName"`
	Password   string `json:"password"`
	Email      string `json:"email"`
	Country    string `json:"country"`
	BirthDate  string `json:"birthDate"`
	Hash       string `json:"hash"`
}

type playsCountObject struct {
	lastTime time.Time
	value    int
	check    bool
	mutex    *sync.Mutex
}

var playsCount sync.Map

var logger *log.Logger
var DB *sql.DB
var JWTAccessSecretKey string
var JWTRefreshSecretKey string
var rdb *redisOrig.Client
var producer sarama.SyncProducer

var graphQlHandler = handler.New(&handler.Config{
	Schema:   &Graphql.Schema, // Передаем правильную схему
	Pretty:   true,
	GraphiQL: false, // Включить интерфейс GraphiQL, если необходимо
})

func playsCountBuilder(username, trackID string) {
	playsCount.LoadOrStore(username+" "+trackID, &playsCountObject{
		lastTime: time.Now(),
		value:    0,
		mutex:    &sync.Mutex{},
	})
}

// @title Главный API сервиса
// @version 1.0
// @description
// @host localhost:8080
// @BasePath /

func main() {
	go playsCountReset()

	var err error

	producer, err = Kafka.NewProducer(logger)
	if err != nil {
		panic(err)
	}

	logger2.Loggerfunc()
	logger = logger2.Logger

	Kafka.LoggerUpdater(logger)

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	rdb, err = RedisConnect(ctx)
	if err != nil {
		logger.Println("Redis DB error: " + err.Error())
		return
	}

	Graphql.RdbInit(rdb)

	JWTAccessSecretKey, err = getenvs("JWT_SECRET_KEY_ACCESS")
	if err != nil {
		logger.Println("Ошибка получения JWTAccessSecretKey:", err)
		return
	}

	JWTRefreshSecretKey, err = getenvs("JWT_SECRET_KEY_REFRESH")
	if err != nil {
		logger.Println("Ошибка получения JWTRefreshSecretKey:", err)
		return
	}

	DB, err = Db.InitDB("Shellshocker", "123123123", "AiartistDB", "localhost", 5432, logger)
	if err != nil {
		logger.Fatalf("Ошибка подключения к БД, %v", err)
	}

	Graphql.DBinit(DB)

	initGRPCClient()

	mux := http.NewServeMux()

	corsMUX := enableCORS(mux)

	mux.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("./react"))))

	mux.HandleFunc("/registerсodeсheck", registerCodeCheckHandler) //passive проверка кода регистрации

	mux.HandleFunc("/signin", signin) //active путь для авторизации, первое действие проверка email\username и password на наличие в БД
	/*mux.HandleFunc("/getallusers", getallusers)*/
	mux.HandleFunc("/signinsend", authentification)      //passive путь для отправки данных, введенных пользователем при авторизации
	mux.HandleFunc("/signup", emailCheck)                //active путь для регистрации, первое действие проверка email на наличие в БД
	mux.HandleFunc("/signupsend", signupSend)            //passive путь для отправки данных при регистрации
	mux.HandleFunc("/emailchecksend", emailCheckHandler) //passive путь для проверки наличия email введенного при регистрации
	mux.HandleFunc("/gettingemail", gettingemail)
	mux.HandleFunc("/uploadmusic", uploadMusic)            //active страница загрузка музыки
	mux.HandleFunc("/uploadmusicsend", uploadMusicHandler) //passive загрузка музыки по GRPC
	mux.HandleFunc("/streammusic", streamMusic)            //active страница c плеером для проигрывания музыки
	mux.HandleFunc("/streammusicsend", streamMusicHLS)     //passive страница c плеером для проигрывания музыки
	mux.HandleFunc("/gettrackmeta", getMeta)               //active получаем мета для трека
	mux.HandleFunc("/gettrackmetasend", getMetaHandler)    //passive отправляем данные
	mux.HandleFunc("/getuserdatasend", getUserDataHandler) //passive получаем данные пользователя
	mux.HandleFunc("/logout", logOutHandler)               //passive удаляем токены
	mux.HandleFunc("/main", mainPage)
	///Получение треков пользователя
	mux.HandleFunc("/getUserTracks", getUserTracksHandler)
	//удаление трека пользователя
	mux.HandleFunc("/deleteusertrack", deleteUserTrackHandler)
	////Активность в реальном времени
	mux.HandleFunc("/liveactionsp", websocketHandler)    //passive
	mux.HandleFunc("/liveactions", websocketPageHandler) //active
	////Плейлисты
	mux.HandleFunc("/addtoplaylist", addToPlaylistHandler)
	mux.HandleFunc("/deletefromplaylist", deleteFromPlaylistHandler)
	mux.HandleFunc("/deleteplaylist", deletePlaylistHandler)
	mux.HandleFunc("/playlistchangestatus", playlistChangeAccessHandler)
	mux.HandleFunc("/getuserplaylists", getUserPlaylistsHandler)
	mux.HandleFunc("/getpublicplaylists", getPublicPlaylistsHandler)
	mux.HandleFunc("/gettracksfromplaylist", getTracksFromPlaylistHandler)
	// Подключаем Swagger UI для просмотра документации
	mux.Handle("/swagger/", httpSwagger.WrapHandler)

	////Graphql
	mux.HandleFunc("/inneractions", graphQlHandlerFirst)

	log.Fatal(http.ListenAndServe(":8080", corsMUX))
}

// graphqlHandler обрабатывает запросы к GraphQL
// @Summary GraphQL endpoint
// @Description Отправка GraphQL-запроса к серверу
// @Tags graphql
// @Accept json
// @Produce json
// @Param query body string true "GraphQL запрос в формате строки"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {string} string "Bad request"
// @Router /inneractions [post]
func graphQlHandlerFirst(w http.ResponseWriter, r *http.Request) {
	graphQlHandler.ServeHTTP(w, r)
}

// getMeta Страница для получения метаданных трека
func getMeta(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		logger.Println("Неверный метод запроса для страницы стриминга музыки")
		http.Error(w, "Неверный метод запроса для страницы стриминга музыки", http.StatusBadRequest)
		return
	}

	http.ServeFile(w, r, "./react/gettrackmetasend.html")
}

func StreamHLS(w http.ResponseWriter, r *http.Request, username, trackID, filePath, segmentBaseURL string) {

	ext := filepath.Ext(filePath)

	switch ext {
	case ".m3u8":
		w.Header().Set("Content-Type", "application/vnd.apple.mpegurl")
		w.Header().Set("Cache-Control", "no-cache")
	case ".ts":
		w.Header().Set("Content-Type", "video/mp2t")
		w.Header().Set("Cache-Control", "no-store")
	default:
		logger.Printf("Unsupported file type: %s\n", ext)
		http.Error(w, "Unsupported file type", http.StatusBadRequest)
		return
	}

	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		logger.Printf("File not found: %s\n", filePath)
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}

	if ext == ".m3u8" {
		content, err := os.ReadFile(filePath)
		if err != nil {
			logger.Printf("Failed to read playlist: %v\n", err)
			http.Error(w, "Failed to read playlist", http.StatusInternalServerError)
			return
		}

		modifiedContent := regexp.MustCompile(`(?m)^(segment\d+\.ts)$`).ReplaceAllString(string(content), segmentBaseURL+"${1}")
		logger.Printf("Modified playlist with segment base URL: %s\n", segmentBaseURL)
		fmt.Printf("Sample modified content:\n%s\n", modifiedContent[:miN(len(modifiedContent), 200)])

		w.Header().Set("Content-Length", fmt.Sprintf("%d", len(modifiedContent)))
		if _, err := w.Write([]byte(modifiedContent)); err != nil {
			logger.Printf("Failed to write response: %v\n", err)
			http.Error(w, "Failed to write response", http.StatusInternalServerError)
			return
		}
		return
	}

	fmt.Println("Отметка 1")
	playsCountBuilder(username, trackID)

	if value, exists := playsCount.Load(username + " " + trackID); exists {
		object := value.(*playsCountObject)

		object.mutex.Lock()
		object.lastTime = time.Now()
		object.value++
		fmt.Println(object.value)
		object.check = true

		if object.value > 7 { //у нас сегмент равен 1 секунде
			playsIncr(username, trackID)
			fmt.Println("Прослушка увеличена")
			object.value = 0
		}
		object.mutex.Unlock()
	}

	fmt.Println("Отправка файла", filePath)
	http.ServeFile(w, r, filePath)
}

func miN(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func streamMusicHLS(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	trackID := r.URL.Query().Get("trackID")

	// Проверка наличия параметров
	if username == "" || trackID == "" {
		logger.Println("Missing username or trackID parameters")
		http.Error(w, "Missing parameters", http.StatusBadRequest)
		return
	}

	// Проверка длины и формата
	if len(username) > 50 || len(trackID) > 20 {
		logger.Println("Username or trackID too long", "username", username, "trackID", trackID)
		http.Error(w, "Invalid parameters", http.StatusBadRequest)
		return
	}
	if !regexp.MustCompile(`^[a-zA-Z0-9_-]+$`).MatchString(username) || !regexp.MustCompile(`^[0-9]+$`).MatchString(trackID) {
		logger.Println("Invalid username or trackID format", "username", username, "trackID", trackID)
		http.Error(w, "Invalid parameters", http.StatusBadRequest)
		return
	}

	// Формируем путь к папке трека
	baseDir := filepath.Join("..", "music-service", "songs")
	hlsDir := filepath.Join(baseDir, username, username+"-"+trackID)

	// Проверка существования директории
	if _, err := os.Stat(hlsDir); os.IsNotExist(err) {
		logger.Println("Track directory not found", "directory", hlsDir)
		http.Error(w, "Track not found", http.StatusNotFound)
		return
	}

	// Проверка файла
	requestedFile := r.URL.Query().Get("file")
	if requestedFile == "" {
		requestedFile = "playlist.m3u8"
	}
	requestedFile = filepath.Base(requestedFile) // Предотвращаем Path Traversal
	if !regexp.MustCompile(`^[a-zA-Z0-9_-]+\.(m3u8|ts)$`).MatchString(requestedFile) {
		logger.Println("Invalid file name", "file", requestedFile)
		http.Error(w, "Invalid file name", http.StatusBadRequest)
		return
	}

	// Формируем полный путь
	filePath := filepath.Join(hlsDir, requestedFile)

	// Проверка, что путь находится внутри baseDir
	absBaseDir, _ := filepath.Abs(baseDir)
	absFilePath, _ := filepath.Abs(filePath)
	if !strings.HasPrefix(absFilePath, absBaseDir) {
		logger.Println("Attempted path traversal", "filePath", absFilePath)
		http.Error(w, "Invalid file path", http.StatusForbidden)
		return
	}

	// Формируем segmentBaseURL с экранированием
	baseURL := "http://localhost:8080"
	segmentBaseURL := fmt.Sprintf("%s/streammusicsend?username=%s&trackID=%s&file=", baseURL, url.QueryEscape(username), url.QueryEscape(trackID))

	StreamHLS(w, r, username, trackID, filePath, segmentBaseURL)
}

func playsCountReset() {
	for range time.Tick(10 * time.Second) {
		playsCount.Range(func(key, value interface{}) bool {
			object := value.(*playsCountObject)
			object.mutex.Lock()
			if object.check {
				if time.Now().Sub(object.lastTime) > 60*time.Second {
					object.value = 0
					object.check = false
				}
			}
			object.mutex.Unlock()
			return true
		})
	}
}

func streamMusic(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		logger.Println("Неверный метод запроса для страницы стриминга музыки")
		http.Error(w, "Неверный метод запроса для страницы стриминга музыки", http.StatusBadRequest)
		return
	}

	http.ServeFile(w, r, "./react/streammusictestpage.html")
}

func uploadMusic(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		logger.Println("Неверный метод запроса для страницы загрузки музыки")
		http.Error(w, "Неверный метод запроса для страницы загрузки музыки", http.StatusBadRequest)
		return
	}

	http.ServeFile(w, r, "./react/uploadmusicpage.html")
}

// Не используется
func gettingemail(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		logger.Println("Неверный метод запроса для получения email")
		http.Error(w, "Неверный метод запроса для получения email", http.StatusBadRequest)
		return
	}

	claims, err := tokensExtractionAndUpdate(w, r)
	if err != nil {
		http.Error(w, "Авторизуйтесь: "+err.Error(), http.StatusBadRequest)
		logger.Println("Авторизуйтесь снова:", err)
		return
	}

	var email string
	err = DB.QueryRow(`SELECT email FROM users WHERE username = $1`, claims.Username).Scan(&email)
	if err != nil {
		http.Error(w, "Ошибка получения данных из БД:"+err.Error(), http.StatusInternalServerError)
		logger.Println("Ошибка получения данных из БД:", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"email":"%s"}`, email)
}

func emailCheck(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodGet {
		logger.Println("Неверный метод запроса для проверки почты")
		http.Error(w, "Неверный метод запроса для проверки почты", http.StatusBadRequest)
		return
	}

	http.ServeFile(w, r, "./react/emailcheck.html")
}
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Разрешаем запросы с нужного источника
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173") // Укажи правильный источник
		// Указываем разрешенные методы
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD")
		// Указываем разрешенные заголовки
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Music-Duration, refresh_token, playlist-name")
		// Разрешаем передачу cookie
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		// Дополнительно можно указать заголовки, которые будут доступны клиенту
		w.Header().Set("Access-Control-Expose-Headers", "Authorization")

		// Обработка preflight запросов (OPTIONS)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		// Обрабатываем основной запрос
		next.ServeHTTP(w, r)
	})
}

func signin(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodGet {
		logger.Println("Неверный метод запроса для регистрации")
		http.Error(w, "Неверный метод запроса для регистрации", http.StatusBadRequest)
		return
	}

	http.ServeFile(w, r, "./react/regstart.html")
}

// signupSend Принимает все метаданные пользователя и добавляет его в БД Users
// @Summary Регистрация нового пользователя
// @Description Принимает все метаданные пользователя согласно структуре User и добавляет его в БД Users
// @Tags authorization
// @Accept application/json
// @Produce application/json
// @Param request body User true "Метаданные пользователя"
// @Success 200 {object} map[string]string "The user has been registered, json("message": "answer")"
// @Failure 400 {string} string "Неверный метод запроса, ошибка обработки данных"
// @Failure 500 {string} string "Ошибка обработки пароля, ошибка добавления пользователя, Ошибка отправки результата"
// @Router /signupsend [post]
func signupSend(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		logger.Println("Неверный метод запроса для регистрации")
		http.Error(w, "Неверный метод запроса для регистрации", http.StatusBadRequest)
		return
	}

	user := &User{}

	err := json.NewDecoder(r.Body).Decode(user)
	if err != nil {
		http.Error(w, "Ошибка обработки данных пользователя: "+err.Error(), http.StatusBadRequest)
		logger.Println("Ошибка обработки данных пользователя: " + err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	hash, err := rdb.Get(ctx, user.Email).Result()
	if err != nil {
		http.Error(w, "Try again later", http.StatusInternalServerError)
		logger.Println("Eror getting register code from redis:" + err.Error())
		return
	}

	if hash != user.Hash {
		http.Error(w, "Wrong request", http.StatusBadRequest)
		logger.Println("Hash is not correct")
		return
	}

	err = rdb.Del(ctx, user.Email).Err()
	if err != nil {
		log.Fatalf("Ошибка удаления ключа: %v", err)
	}

	password, err := hashPassword(user.Password)
	if err != nil {
		http.Error(w, "Ошибка обработки пароля: "+err.Error(), http.StatusInternalServerError)
		logger.Println("Ошибка обработки пароля: " + err.Error())
		return
	}

	ctx, cancel = context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	//добавление в список пользователей по их количеству прослушек
	err = rdb.ZAdd(ctx, "Users", redisOrig.Z{
		Score:  0,
		Member: user.Username,
	}).Err()

	if err != nil {
		http.Error(w, "error creating users data"+err.Error(), http.StatusInternalServerError)
		logger.Println("error creating users data" + err.Error())
		return
	}

	err = rdb.HSet(ctx, "User:"+user.Username, map[string]interface{}{
		"username":   user.Username,
		"firstName":  user.FirstName,
		"artistName": user.ArtistName,
		"email":      user.Email,
		"country":    user.Country,
		"birthDate":  user.BirthDate,
		"playlists":  "",
		"plays":      0,
		"likes":      0,
	}).Err()
	if err != nil {
		http.Error(w, "error creating users data"+err.Error(), http.StatusInternalServerError)
		logger.Println("error creating users data" + err.Error())
		return
	}

	err = Db.CreateUser(DB, user.Username, user.FirstName, user.ArtistName, password, user.Email, user.Country, user.BirthDate, logger)
	if err != nil {
		logger.Printf("Ошибка добавления пользователя в БД: , %v", err)
		http.Error(w, "Ошибка добавления пользователя в БД: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	err = json.NewEncoder(w).Encode(map[string]string{
		"message": "Пользователь успешно зарегистрирован",
	})
	if err != nil {
		http.Error(w, "Ошибка отправки результата операции добавления пользователя: "+err.Error(), http.StatusInternalServerError)
		logger.Println("Ошибка отправки результата операции добавления пользователя: " + err.Error())
		return
	}
}
