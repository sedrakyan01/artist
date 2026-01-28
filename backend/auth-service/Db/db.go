package Db

import (
	"database/sql"
	"fmt"
	"log"
)

func InitDB(user, password, dbname, host string, port int, logger *log.Logger) (*sql.DB, error) {
	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname)
	DB, err := sql.Open("postgres", dsn)
	if err != nil {
		logger.Printf("Ошибка подключения к бд: %v", err)
		return nil, fmt.Errorf("ошибка подключения к бд: %w", err)
	}

	err = DB.Ping()
	if err != nil {
		logger.Printf("Ошибка пинга бд: %w", err)
		return nil, fmt.Errorf("ошибка подключения к бд: %w", err)
	}

	err = CreateSchema(DB, logger)
	if err != nil {
		log.Fatalf("Ошибка создания структуры базы данных: %v", err)
	}

	logger.Println("Соединение с БД установлено")
	return DB, nil
}

func CreateUser(DB *sql.DB, username, firstname, secondname, password, email, country, birthDate string, logger *log.Logger) error {
	query := `INSERT INTO users (user_name, first_name, artist_name, password, email, country, birth_date) VALUES ($1, $2, $3, $4, $5, $6, $7)`

	_, err := DB.Exec(query, username, firstname, secondname, password, email, country, birthDate)
	if err != nil {
		logger.Printf("Ошибка добавления нового пользователя в БД: %w", err)
		return fmt.Errorf("Ошибка добавления нового пользователя в БД: %w", err)
	}
	logger.Printf("Пользователь добавлен успешно")
	return nil
}

func CreateSchema(DB *sql.DB, logger *log.Logger) error {
	query := `
    CREATE TABLE IF NOT EXISTS Users (
       id SERIAL PRIMARY KEY,
       user_name VARCHAR(100) NOT NULL UNIQUE,
       first_name VARCHAR(100) NOT NULL,
       artist_name VARCHAR(100) NOT NULL,
       password TEXT NOT NULL,
       email VARCHAR(100) NOT NULL UNIQUE CHECK (email LIKE '%@%'),
       country VARCHAR(100) NOT NULL,
       birth_date DATE NOT NULL
    );`

	_, err := DB.Exec(query)
	if err != nil {
		logger.Println("Ошибка создания таблицы users: " + err.Error())
		return fmt.Errorf("ошибка создания таблицы users: %v", err)
	}

	logger.Println("Таблица users успешно создана")

	query = `
    CREATE TABLE IF NOT EXISTS trackMeta (
       id SERIAL PRIMARY KEY,
       artist_name VARCHAR(100) NOT NULL,
       title VARCHAR(100) NOT NULL,
       album_name VARCHAR(100),
       genre VARCHAR(100) NOT NULL,
       description VARCHAR(300),
       duration INT NOT NULL,
       release_year INT NOT NULL,
       add_to_db_date TIMESTAMP NOT NULL,
       owner VARCHAR(100) NOT NULL,
       likes BIGINT DEFAULT 0,
       plays BIGINT DEFAULT 0
    );`

	_, err = DB.Exec(query)
	if err != nil {
		logger.Println("Ошибка создания таблицы trackMeta: " + err.Error())
		return fmt.Errorf("ошибка создания таблицы trackMeta: %v", err)
	}

	logger.Println("Таблица trackMeta успешно создана")
	return nil
}
