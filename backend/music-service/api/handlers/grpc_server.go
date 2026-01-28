package main

import (
	"bytes"
	"context"
	"database/sql"
	"errors"
	"fmt"
	_ "github.com/lib/pq"
	redisOrig "github.com/redis/go-redis/v9"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/reflection"
	"google.golang.org/protobuf/types/known/timestamppb"
	"io"
	"log"
	"music-service/api/logger"
	"music-service/api/proto/gen"
	"music-service/redisApi"
	"net"
	"os"
	"path/filepath"
	"strconv"
	"time"
)

var logging = logger.Loggerfunc()
var rdb *redisOrig.Client

type MusicServiceServer struct {
	gen.UnimplementedMusicServiceServer
	db *sql.DB
}

func (s *MusicServiceServer) UploadMusic(ctx context.Context, req *gen.UploadMusicRequest) (*gen.UploadMusicResponse, error) {
	duration, extension, bitRateKbps, err := GetTrackInfo(req.GetMusicContent())
	if err != nil {
		logging.Printf("ошибка получения длительности и битрейта: %v", err)
		return nil, fmt.Errorf("ошибка сохранения трека\n")
	}
	fmt.Println(duration, extension, bitRateKbps)

	/*if extension != "mp3" && extension != "MP3" {
		return nil, fmt.Errorf("ожидается трек в формате mp3\n")
	}*/

	timeAddToDbDate := req.GetAddToDbDate().AsTime()
	// тут реализовать добавку мета в бд

	var trackID int64
	//первое добавление данных трека
	query := `INSERT INTO trackMeta (artist_name, title, album_name, genre, description, duration, release_year, add_to_db_date, owner) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`

	err = s.db.QueryRow(query, req.ArtistName, req.Title, req.AlbumName, req.Genre, req.Description, int(duration), req.ReleaseYear, timeAddToDbDate, req.Owner).Scan(&trackID)
	if err != nil {
		logging.Printf("ошибка добавления метаданных для %s,%s: %v", req.ArtistName, req.Title, err)
		return nil, fmt.Errorf("ошибка добавления метаданных для %s,%s: %w", req.ArtistName, req.Title, err)
	}

	trackIDstring := strconv.FormatInt(trackID, 10)

	err = saveFile("pictures", ".jpeg", req.Owner, trackIDstring, req.GetTrackPicture())
	if err != nil {
		return nil, fmt.Errorf("saving file error: %v", err)
	}

	err = ConvertAudioToHLS(req.GetMusicContent(), req.Owner, trackIDstring)
	if err != nil {
		query = `DELETE FROM trackMeta WHERE id = $1`
		_, err = s.db.Exec(query, trackID)
		if err != nil {
			logging.Printf("ошибка удаления из постгре метаданных для %s,%s: %v\n", req.ArtistName, req.Title, err)
		}

		logging.Printf("ошибка добавления метаданных для %s,%s: %v\n", req.ArtistName, req.Title, err)
		return nil, fmt.Errorf("ошибка сохранения трека\n")
	}

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	//второе добавление данных трека
	err = rdb.HSet(ctx, "track"+trackIDstring, map[string]interface{}{
		"artistName":  req.ArtistName,
		"title":       req.Title,
		"albumName":   req.AlbumName,
		"genre":       req.Genre,
		"description": req.Description,
		"duration":    duration,
		"releaseYear": req.ReleaseYear,
		"addToDbDate": timeAddToDbDate,
		"owner":       req.Owner,
		"likes":       "0",
		"plays":       "0",
		"trackID":     trackIDstring,
	}).Err()

	if err != nil {
		_, _ = s.db.Exec(`DELETE FROM trackMeta WHERE id = $1`, trackID)
		logging.Println("Ошибка добавления метаданных в Redis")
		return nil, errors.New("ошибка добавления метаданных в Redis")
	}
	//третье добавление данных трека
	err = rdb.LPush(ctx, "UserTracks:"+req.Owner, trackIDstring).Err()
	if err != nil {
		_, _ = s.db.Exec(`DELETE FROM trackMeta WHERE id = $1`, trackID)
		logging.Println("Ошибка добавления метаданных в Redis")
		return nil, errors.New("ошибка добавления метаданных в Redis")
	}

	//четвертое добавление данных трека
	err = addToListRedis(ctx, "newTracks", "track"+trackIDstring)
	if err != nil {
		return nil, err
	}
	//пятое добавление данных трека
	err = addToListRedis(ctx, req.Genre, "track"+trackIDstring)
	if err != nil {
		return nil, err
	}
	//шестое добавление данных трека
	err = addToSortedSetRedis(ctx, "likes", "track"+trackIDstring)
	if err != nil {
		return nil, err
	}
	//седьмое добавление данных трека
	err = addToSortedSetRedis(ctx, "plays", "track"+trackIDstring)
	if err != nil {
		return nil, err
	}

	return &gen.UploadMusicResponse{
		Result: "Файл успешно записан",
	}, nil
}

func addToSortedSetRedis(ctx context.Context, sortedSetName, trackName string) error {
	err := rdb.ZAdd(ctx, sortedSetName, redisOrig.Z{
		Score:  0,
		Member: trackName,
	}).Err()
	if err != nil {
		logging.Printf("error to add to Zset %s", sortedSetName)
		return fmt.Errorf("error to add to Zset %s", sortedSetName)
	}
	return nil
}

func addToListRedis(ctx context.Context, listName, trackName string) error {
	err := rdb.LPush(ctx, listName, trackName).Err()
	if err != nil {
		logging.Printf("error to add %s to list %s", trackName, listName)
		return fmt.Errorf("error to add %s to list %s", trackName, listName)
	}
	return nil
}

func saveFile(fileType, fileExt, username, trackID string, data []byte) error {
	filePath := filepath.Join(fileType, username, username+"-"+trackID+fileExt)

	dir := filepath.Dir(filePath)

	if _, err := os.Stat(filePath); err == nil {
		logging.Printf("file with such name is already exists: %v", err)
		return fmt.Errorf("file with such name is already exists: %v", err)
	}

	if _, err := os.Stat(dir); err != nil {
		err = os.MkdirAll(dir, os.ModePerm)
		if err != nil {
			logging.Printf("Ошибка создания директории: %v", err)
			return fmt.Errorf("не удалось создать директорию: %w", err)
		}
	}

	file, err := os.Create(filePath)
	if err != nil {
		return fmt.Errorf("ошибка сохранения файла: %v", err)
	}
	defer file.Close()

	_, err = file.Write(data)
	if err != nil {
		return fmt.Errorf("ошибка записи файла")
	}
	return nil
}

func durationDetermine(song []byte) float64 {

	bits := len(song) * 8
	duration := float64(bits) / float64(196000)

	return duration
}

func fileToBytes(file *os.File) ([]byte, error) {
	data, err := io.ReadAll(file)
	if err != nil {
		return nil, err
	}
	return data, nil
}

func (s *MusicServiceServer) StreamMusic(req *gen.StreamMusicRequest, stream gen.MusicService_StreamMusicServer) error {
	filePath := filepath.Join("./songs", req.Username, req.Username+"-"+req.TrackId)

	trackAAC_ADTS_CBR, err := os.Open(filePath)
	if err != nil {
		return fmt.Errorf("ошибка открытия файла: %v", err)
	}
	defer trackAAC_ADTS_CBR.Close()

	logging.Println("файл для стриминга открыт")

	trackAAC_ADTS_CBR_bytes, err := io.ReadAll(trackAAC_ADTS_CBR)
	if err != nil {
		logging.Println("ошибка чтения данных из trackAAC_ADTS_CBR_bytes:" + err.Error())
		return errors.New("ошибка чтения данных")
	}

	duration := durationDetermineADTS(trackAAC_ADTS_CBR_bytes, 128000)

	if err = stream.SendHeader(metadata.Pairs("music-duration", fmt.Sprintf("%f", duration))); err != nil {
		logging.Printf("ошибка отправки метаданных: %v\n", err)
		return fmt.Errorf("ошибка отправки метаданных: %v", err)
	}

	logging.Println("metadata is written")

	startPosition := req.GetStartPosition()

	if startPosition > int64(duration) {
		logging.Println("Стартовая позиция больше чем длина файла")
		return fmt.Errorf("стартовая позиция больше чем длина файла")
	}

	// Перемотка до начала позиции, возвращает готовый кусок с секунды с учетом фреймов
	songBytesPart, err := sliceADTSFromSecond(trackAAC_ADTS_CBR_bytes, float64(startPosition), 128000)
	if err != nil {
		logging.Printf("ошибка обрезки по стартовой позиции: %v\n", err)
		return fmt.Errorf("ошибка стрима трека")
	}

	frames, err := parseADTSFramesRaw(songBytesPart) //переводит биты в готовые фреймы
	if err != nil {
		logging.Printf("ошибка создания фреймов: %v\n", err)
		return fmt.Errorf("ошибка стрима трека")
	}

	var bytesBuffer bytes.Buffer
	for i := 0; i < len(frames); i += 200 {
		end := i + 200
		if end > len(frames) {
			end = len(frames)
		}

		for _, v := range frames[i:end] {
			bytesBuffer.Write(v)
		}

		data := bytesBuffer.Bytes() //пачка из 200 фреймов

		errSend := stream.Send(&gen.StreamMusicResponse{Data: data})
		if errSend != nil {
			logging.Printf("ошибка стрима трека: %v\n", errSend)
			return fmt.Errorf("ошибка стрима трека: %v", errSend)
		}

		bytesBuffer.Reset()
	}

	logging.Println("стриминг завершен")

	return nil
}

func (s *MusicServiceServer) GetMeta(ctx context.Context, req *gen.GetMetaRequest) (*gen.GetMetaResponse, error) {
	trackID := req.GetTrackId()

	ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()

	/*
		var artistName, title, albumName, genre, description, owner string
		var addToDBDate time.Time
		var duration, releaseYear int32
		var likes, plays int64

		query := `SELECT artist_name, title, album_name, genre, description, duration, release_year, add_to_db_date, owner, likes, plays FROM trackMeta WHERE id = $1`

			err := s.db.QueryRow(query, trackID).Scan(&artistName, &title, &albumName, &genre, &description, &duration, &releaseYear, &addToDBDate, &owner, &likes, &plays)
			if err != nil {
					// Добавляем больше контекста в ошибку, чтобы было понятно, какой именно трек не удалось найти
					if err == sql.ErrNoRows {
						return nil, fmt.Errorf("метаданные для трека с ID %d не найдены", trackID)
					}
					log.Printf("Ошибка при получении метаданных для трека с ID %d: %v", trackID, err)
					return nil, fmt.Errorf("ошибка при получении метаданных для трека с ID %d: %w", trackID, err)
				}*/

	trackIDstring := strconv.FormatInt(int64(trackID), 10)

	trackMetaR, err := rdb.HGetAll(ctx, "track"+trackIDstring).Result()
	if err != nil {
		logging.Println("getting track meta error: " + err.Error())
		return nil, fmt.Errorf("getting track meta error: %v", err)
	}

	durationString, _ := trackMetaR["duration"]
	durationFloat, _ := strconv.ParseFloat(durationString, 64)
	durationInt32 := int(durationFloat)
	releaseYear, _ := strconv.Atoi(trackMetaR["releaseYear"])
	likes, _ := strconv.Atoi(trackMetaR["likes"])
	plays, _ := strconv.Atoi(trackMetaR["plays"])

	addToDBDate, _ := time.Parse(time.RFC3339Nano, trackMetaR["addToDbDate"])
	timeStamp := timestamppb.New(addToDBDate)

	file, err := os.Open(filepath.Join("pictures", trackMetaR["owner"], trackMetaR["owner"]+"-"+trackIDstring+".jpeg"))

	if err != nil {
		return nil, fmt.Errorf("geting track picture error: %v", err)
	}
	defer file.Close()

	// Получаем информацию о файле
	fileInfo, err := file.Stat()
	if err != nil {
		logging.Printf("Ошибка получения информации о файле: %v", err)
		return nil, fmt.Errorf("error getting file info: %w", err)
	}

	// Читаем файл в буфер
	bufferBytes := make([]byte, fileInfo.Size())
	n, err := file.Read(bufferBytes)
	if err != nil {
		logging.Printf("Ошибка чтения файла изображения: %v", err)
		return nil, fmt.Errorf("error reading file: %w", err)
	}

	return &gen.GetMetaResponse{
		ArtistName:   trackMetaR["artistName"],
		Title:        trackMetaR["title"],
		AlbumName:    trackMetaR["albumName"],
		Genre:        trackMetaR["genre"],
		Description:  trackMetaR["description"],
		Duration:     int32(durationInt32),
		ReleaseYear:  int32(releaseYear),
		AddToDbDate:  timeStamp,
		Owner:        trackMetaR["owner"],
		Likes:        int64(likes),
		Plays:        int64(plays),
		TrackPicture: bufferBytes[:n],
		TrackID:      trackID,
	}, nil
}

func (s *MusicServiceServer) connectDB() error {
	dsn := "host=localhost port=5432 user=Shellshocker password=123123123 dbname=AiartistDB sslmode=disable"
	DB, err := sql.Open("postgres", dsn)
	if err != nil {
		logging.Printf("Ошибка подключения к бд в микросервисе музыки: %v", err)
		return fmt.Errorf("ошибка подключения к бд: %w", err)
	}

	err = DB.Ping()
	if err != nil {
		logging.Printf("Ошибка пинга бд: %v", err)
		return fmt.Errorf("ошибка подключения к бд: %w", err)
	}

	s.db = DB
	return nil
}

func main() {
	ctx := context.Background()

	var err error
	rdb, err = redis.RedisConnect(ctx)
	if err != nil {
		logging.Println("Redis DB error: " + err.Error())
		return
	}
	defer rdb.Close()

	server := &MusicServiceServer{}

	err = server.connectDB()
	if err != nil {
		logging.Fatalf("Ошибка подключения к бд в микросервисе музыки: %v", err)
	}
	if server.db != nil {
		defer server.db.Close()
	}

	listener, err := net.Listen("tcp", ":8081")
	if err != nil {
		logging.Fatalf("Ошибка создания слушателя на порту 8081: %v", err)
	}

	grpcServer := grpc.NewServer(
		grpc.MaxRecvMsgSize(10 << 20),
	)

	gen.RegisterMusicServiceServer(grpcServer, server)

	reflection.Register(grpcServer)

	err = grpcServer.Serve(listener)
	if err != nil {
		log.Fatalf("Ошибка запуска слушателя на порту 8081: %v", err)
	}
}
