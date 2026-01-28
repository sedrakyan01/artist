package main

import (
	"errors"
	"fmt"
	"github.com/golang-jwt/jwt"
	"net/http"
	"strings"
	"time"
)

type ClaimsAccessToken struct {
	Username string `json:"username"`
	UserID   int    `json:"userID"`
	jwt.StandardClaims
}

type ClaimsRefreshToken struct {
	jwt.StandardClaims
}

func generateAccessJWTToken(username string, userID int, JWTAccessSecretKey string) (string, error) {

	accessExpirationTime := time.Now().Add(24 * time.Hour)

	accessClaims := &ClaimsAccessToken{
		Username: username,
		UserID:   userID,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: accessExpirationTime.Unix(),
			Issuer:    "AiArtist",
		},
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)

	signedAccessToken, err := accessToken.SignedString([]byte(JWTAccessSecretKey))
	if err != nil {
		logger.Printf("ошибка подписания access токена: %w", err)
		return "", fmt.Errorf("ошибка подписания access токена: %w", err)
	}

	return signedAccessToken, nil
}

func generateRefreshJWTToken(JWTRefreshSecretKey string) (string, error) {

	refreshExpirationTime := time.Now().Add(120 * time.Hour)

	refreshClaims := &ClaimsRefreshToken{
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: refreshExpirationTime.Unix(),
			Issuer:    "AiArtist",
		},
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)

	signedRefreshToken, err := refreshToken.SignedString([]byte(JWTRefreshSecretKey))
	if err != nil {
		logger.Printf("ошибка подписания refresh токена: %w", err)
		return "", fmt.Errorf("ошибка подписания refresh токена: %w", err)
	}

	return signedRefreshToken, nil
}

func validateAccessJWT(tokenString, JWTAccessSecretKey string) (*ClaimsAccessToken, error) {
	token, err := jwt.ParseWithClaims(tokenString, &ClaimsAccessToken{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			logger.Printf("Ошибка при парсинге токена: %v", token.Header["alg"])
			return nil, fmt.Errorf("ошибка при парсинге токена: %v", token.Header["alg"])
		}

		return []byte(JWTAccessSecretKey), nil
	})

	if err != nil {
		if strings.Contains(err.Error(), "ошибка при парсинге токена") {
			logger.Printf("ошибка при парсинге токена: %v", err)
			return nil, fmt.Errorf("ошибка при парсинге токена: %v", err)
		}
	}

	if claims, ok := token.Claims.(*ClaimsAccessToken); ok && token.Valid {
		return claims, nil
	} else {
		if claims.ExpiresAt < time.Now().Unix() {
			logger.Println("Токен просрочен")
			return claims, errors.New("токен просрочен")
		} else {
			logger.Println("Ошибка токена, авторизуйтесь повторно")
			return nil, errors.New("ошибка токена, авторизуйтесь повторно")
		}
	}
}

func validateRefreshJWT(tokenString, JWTRefreshSecretKey string) error {
	token, err := jwt.ParseWithClaims(tokenString, &ClaimsRefreshToken{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			logger.Printf("Неверный метод подписи токена: %v", token.Header["alg"])
			return nil, fmt.Errorf("неверный метод подписи токена: %v", token.Header["alg"])
		}

		return []byte(JWTRefreshSecretKey), nil
	})

	if err != nil {
		logger.Printf("ошибка при парсинге токена: %w", err)
		return fmt.Errorf("ошибка при парсинге токена: %w", err)
	}

	if !token.Valid {
		logger.Printf("ошибка токена: %w", err)
		return fmt.Errorf("ошибка токена: %w", err)
	}

	return nil
}

func allTokensChecking(accessToken, refreshToken, JWTAccessSecretKey, JWTRefreshSecretKey string) (*ClaimsAccessToken, string, error) {
	claims, err := validateAccessJWT(accessToken, JWTAccessSecretKey)
	if err != nil {
		if err.Error() == "токен просрочен" {
			err := validateRefreshJWT(refreshToken, JWTRefreshSecretKey)
			if err != nil {
				return nil, "", err
			} else {
				newAccessToken, err := generateAccessJWTToken(claims.Username, claims.UserID, JWTAccessSecretKey)
				if err != nil {
					logger.Println("Ошибка генерации нового токена:", err)
					return nil, "", err
				} else {
					return claims, newAccessToken, nil
				}
			}
		} else {
			return nil, "", err
		}
	}
	return claims, "", nil
}

func tokensExtractionAndUpdate(w http.ResponseWriter, r *http.Request) (*ClaimsAccessToken, error) {
	refreshToken, err := r.Cookie("refresh_token")
	if err != nil {
		logger.Println("Refresh токен отсутствует в запросе:", err)
		return nil, err
	}
	refreshTokenValue := refreshToken.Value

	accessTokenValue := r.Header.Get("Authorization")
	if accessTokenValue == "" {
		logger.Println("Отсутствует токен в заголовке")
		return nil, errors.New("отсутствует токен в заголовке")
	}

	if strings.HasPrefix(accessTokenValue, "Bearer ") {
		accessTokenValue = accessTokenValue[len("Bearer "):]
	} else {
		logger.Println("Неверный формат токена")
		return nil, errors.New("неверный формат токена")
	}

	claims, newToken, err := allTokensChecking(accessTokenValue, refreshTokenValue, JWTAccessSecretKey, JWTRefreshSecretKey)
	if newToken != "" {
		w.Header().Set("Authorization", "Bearer "+newToken)
	}

	return claims, err
}
