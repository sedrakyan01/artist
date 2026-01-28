package main

import (
	"context"
	"github.com/redis/go-redis/v9"
)

func RedisConnect(ctx context.Context) (*redis.Client, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "123123123",
		DB:       0,
	})

	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		logger.Println("Ошибка подключения к Redis: " + err.Error())
		return nil, err
	}

	return rdb, nil
}
