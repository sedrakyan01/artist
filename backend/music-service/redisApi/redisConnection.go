package redis

import (
	"context"
	"github.com/redis/go-redis/v9"
	"music-service/api/logger"
)

func RedisConnect(ctx context.Context) (*redis.Client, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "123123123",
		DB:       0,
	})

	logging := logger.Loggerfunc()

	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		logging.Println("Ошибка подключения к Redis: " + err.Error())
		return nil, err
	}

	return rdb, nil
}
