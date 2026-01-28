package Graphql

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/graphql-go/graphql"
	"github.com/redis/go-redis/v9"
	"time"
)

var rdb *redis.Client
var DB *sql.DB

func RdbInit(redisConn *redis.Client) {
	rdb = redisConn
}

func DBinit(dbConn *sql.DB) {
	DB = dbConn
}

var Query = graphql.NewObject(graphql.ObjectConfig{
	Name:   "RootQuery",
	Fields: graphql.Fields{
		// Можете оставить пустым или добавить простые поля для теста
	},
})

var Mutation = graphql.NewObject(graphql.ObjectConfig{
	Name: "Mutation",
	Fields: graphql.Fields{
		"newLike": &graphql.Field{
			Type: graphql.Float,
			Args: graphql.FieldConfigArgument{
				"trackID": &graphql.ArgumentConfig{
					Type: graphql.NewNonNull(graphql.String),
				},
			},
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
				defer cancel()

				trackIDstring, exists := p.Args["trackID"].(string)
				if !exists {
					return nil, fmt.Errorf("trackID is required")
				}

				pipe := rdb.TxPipeline()

				incrCmd := pipe.ZIncrBy(ctx, "likes", 1, "track"+trackIDstring)

				_, err := pipe.Exec(ctx)
				if err != nil {
					return nil, err
				}

				likesNewValue, err := incrCmd.Result()
				if err != nil {
					return nil, err
				}

				rdb.HSet(ctx, "track"+trackIDstring, "likes", likesNewValue)

				if int(likesNewValue)%10 == 0 {
					query := `UPDATE trackmeta SET likes = $1 WHERE id = $2`
					DB.Exec(query, likesNewValue, trackIDstring)
				}

				return likesNewValue, nil
			},
		},
	},
})

// Схема для сервера GraphQL
var Schema, _ = graphql.NewSchema(graphql.SchemaConfig{
	Query:    Query,
	Mutation: Mutation,
})
