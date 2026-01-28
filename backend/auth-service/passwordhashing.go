package main

import (
	"golang.org/x/crypto/bcrypt"
)

func hashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	return string(hashedPassword), nil
}

func checkHashedPassword(password, hashedPassword string) bool {
	result := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	if result != nil {
		return false
	}
	return true
}
