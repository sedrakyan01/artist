package main

import (
	"bufio"
	"bytes"
	"encoding/binary"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

// GetTrackInfo анализирует аудиоданные из байтов и возвращает длительность, расширение и битрейт
func GetTrackInfo(audioData []byte) (float64, string, int, error) {
	cmd := exec.Command("ffprobe",
		"-v", "error",
		"-show_format",
		"-show_streams",
		"-print_format", "json",
		"-")

	cmd.Stdin = bytes.NewReader(audioData)

	var out bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &out

	err := cmd.Run()
	if err != nil {
		return 0, "", 0, fmt.Errorf("FFprobe failed: %s | %w", out.String(), err)
	}

	var probeData struct {
		Streams []struct {
			CodecType string `json:"codec_type"`
			CodecName string `json:"codec_name"`
			BitRate   string `json:"bit_rate"`
		} `json:"streams"`
		Format struct {
			Duration   string `json:"duration"`
			BitRate    string `json:"bit_rate"`
			FormatName string `json:"format_name"`
		} `json:"format"`
	}

	if err := json.Unmarshal(out.Bytes(), &probeData); err != nil {
		return 0, "", 0, fmt.Errorf("failed to parse ffprobe output: %w", err)
	}

	var codecName, streamBitRate string
	for _, stream := range probeData.Streams {
		if stream.CodecType == "audio" {
			codecName = stream.CodecName
			streamBitRate = stream.BitRate
			break
		}
	}

	if codecName == "" {
		return 0, "", 0, errors.New("no audio stream found")
	}

	extension := mapCodecToExtension(codecName)
	if extension == "" {
		extension = strings.Split(probeData.Format.FormatName, ",")[0]
	}

	duration, err := strconv.ParseFloat(strings.TrimSpace(probeData.Format.Duration), 64)
	if err != nil {
		return 0, extension, 0, fmt.Errorf("failed to parse duration: %w", err)
	}

	bitRateStr := streamBitRate
	if bitRateStr == "" {
		bitRateStr = probeData.Format.BitRate
	}
	bitRate, err := strconv.Atoi(strings.TrimSpace(bitRateStr))
	if err != nil || bitRate <= 0 {
		return duration, extension, 0, fmt.Errorf("invalid bitrate: %s", bitRateStr)
	}

	return duration, extension, bitRate / 1000, nil
}

func mapCodecToExtension(codec string) string {
	codecMap := map[string]string{
		"mp3":  "mp3",
		"aac":  "aac",
		"flac": "flac",
		"ogg":  "ogg",
		"opus": "opus",
		"wav":  "wav",
		"m4a":  "m4a",
	}
	return codecMap[strings.ToLower(codec)]
}
func ConvertAudioToHLS(audioData []byte, username, trackID string) error {
	// Создаем временный файл с уникальным именем
	tmpDir := os.TempDir()
	tmpFileName := fmt.Sprintf("audio_%d_%s.m4a", time.Now().UnixNano(), randomString(6))
	tmpFilePath := filepath.Join(tmpDir, tmpFileName)

	// Записываем данные во временный файл
	if err := os.WriteFile(tmpFilePath, audioData, 0644); err != nil {
		return fmt.Errorf("failed to write temp file: %w", err)
	}
	defer os.Remove(tmpFilePath) // Гарантированное удаление после использования

	// Пути для выходных файлов
	outputDir := filepath.Join("songs", username, username+"-"+trackID)
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		return fmt.Errorf("failed to create output directory: %w", err)
	}

	// Команда FFmpeg
	cmd := exec.Command("ffmpeg",
		"-hide_banner",
		"-y",
		"-i", tmpFilePath,
		"-vn",
		"-c:a", "aac",
		"-b:a", "128k",
		"-f", "hls",
		"-hls_time", "1",
		"-hls_list_size", "0",
		"-hls_flags", "split_by_time",
		"-hls_segment_type", "mpegts",
		"-hls_playlist_type", "vod",
		"-hls_segment_filename", filepath.Join(outputDir, "segment%d.ts"),
		filepath.Join(outputDir, "playlist.m3u8"),
	)

	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("ffmpeg error: %v\n%s", err, stderr.String())
	}

	return nil
}

// Вспомогательная функция для генерации случайной строки
func randomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(b)
}

// Вспомогательная функция для получения длительности аудио
func getAudioDuration(audioData []byte) (float64, error) {
	cmd := exec.Command("ffprobe",
		"-hide_banner",
		"-loglevel", "error",
		"-i", "pipe:0",
		"-show_entries", "format=duration",
		"-of", "default=noprint_wrappers=1:nokey=1",
	)

	cmd.Stdin = bytes.NewReader(audioData)
	var out bytes.Buffer
	cmd.Stdout = &out

	if err := cmd.Run(); err != nil {
		return 0, fmt.Errorf("ffprobe error: %w", err)
	}

	durationStr := strings.TrimSpace(out.String())
	duration, err := strconv.ParseFloat(durationStr, 64)
	if err != nil {
		return 0, fmt.Errorf("parse duration error: %w", err)
	}

	return duration, nil
}

func parseADTSFramesRaw(data []byte) ([][]byte, error) {
	var frames [][]byte
	pos := 0
	for pos < len(data)-7 {
		if data[pos] == 0xFF && (data[pos+1]&0xF0) == 0xF0 {
			frameLength := int(((uint16(data[pos+3]&0x03) << 11) | (uint16(data[pos+4]) << 3) | (uint16(data[pos+5]) >> 5)))
			if frameLength <= 7 || pos+frameLength > len(data) {
				return nil, errors.New("некорректная длина фрейма или выход за границы")
			}
			frame := data[pos : pos+frameLength]
			frames = append(frames, frame)
			pos += frameLength
		} else {
			pos++
		}
	}
	if len(frames) == 0 {
		return nil, errors.New("не найдены фреймы ADTS")
	}
	return frames, nil
}

func sliceADTSFromSecond(aacADTS []byte, seekSeconds float64, bitrate int) ([]byte, error) {
	if bitrate <= 0 {
		return nil, fmt.Errorf("invalid bitrate")
	}

	// 1. Вычисляем стартовую позицию по секундам
	bytesPerSecond := bitrate / 8
	startOffset := int(seekSeconds * float64(bytesPerSecond))

	// 2. Ищем ближайший заголовок ADTS фрейма (0xFFFx) после смещения
	i := startOffset
	for i < len(aacADTS)-1 {
		// ADTS Syncword: 0xFFF (12 бит), на практике ищем первые два байта
		if aacADTS[i] == 0xFF && (aacADTS[i+1]&0xF0) == 0xF0 {
			// Нашли валидный фрейм
			return aacADTS[i:], nil
		}
		i++
	}

	return nil, fmt.Errorf("could not find ADTS syncword after offset %d", startOffset)
}

func ConvertMP3ToAAC_ADTS_CBR(mp3Data []byte) ([]byte, error) {
	cmd := exec.Command("ffmpeg",
		"-hide_banner",
		"-loglevel", "error",
		"-f", "mp3", // входной формат
		"-i", "pipe:0", // читаем из stdin
		"-c:a", "aac", // кодек AAC
		"-b:a", "128k", // фиксированный битрейт = CBR
		"-aac_coder", "twoloop", // стабильный энкодер (необязательно, но часто рекомендуют)
		"-f", "adts", // формат вывода ADTS (AAC с заголовками)
		"-movflags", "+faststart", // для совместимости (опц.)
		"pipe:1", // пишем в stdout
	)

	var outBuf bytes.Buffer
	cmd.Stdin = bytes.NewReader(mp3Data)
	cmd.Stdout = &outBuf

	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("ffmpeg error: %w", err)
	}

	return outBuf.Bytes(), nil
}

func convertMP3ToCBRBytes(inputData []byte, bitrate string) ([]byte, error) {
	cmd := exec.Command(
		"ffmpeg",
		"-y",
		"-f", "mp3", // входной формат
		"-i", "pipe:0", // читаем с stdin
		"-f", "mp3", // выходной формат
		"-codec:a", "libmp3lame",
		"-b:a", bitrate,
		"-ar", "44100",
		"-ac", "2",
		"-fflags", "+bitexact",
		"-flags:a", "+bitexact",
		"pipe:1", // пишем в stdout
	)

	// Буферы для ввода и вывода
	var outBuf bytes.Buffer
	cmd.Stdout = &outBuf

	// Стандартная ошибка (полезна для отладки)
	var errBuf bytes.Buffer
	cmd.Stderr = &errBuf

	stdin, err := cmd.StdinPipe()
	if err != nil {
		return nil, fmt.Errorf("ошибка создания stdin: %w", err)
	}

	// Пишем inputData в stdin ffmpeg
	go func() {
		defer stdin.Close()
		_, _ = stdin.Write(inputData)
	}()

	// Запускаем ffmpeg
	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("ffmpeg error: %v\nstderr: %s", err, errBuf.String())
	}

	return outBuf.Bytes(), nil
}

func isMP3FrameHeader(header []byte) bool {
	if len(header) < 4 {
		return false
	}
	// Проверяем, что первые 11 бит равны 1: header[0] == 0xFF и старшие 3 бита header[1] == 0xE0
	return header[0] == 0xFF && (header[1]&0xE0) == 0xE0
}

// Парсим размер MP3 фрейма из заголовка
func getMP3FrameSize(header []byte) int {
	if len(header) < 4 {
		return -1
	}

	// Таблицы битрейтов и частот, для MPEG1 Layer III
	bitrates := []int{
		0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0,
	}
	sampleRates := []int{44100, 48000, 32000, 0}

	bitrateIndex := (header[2] >> 4) & 0x0F
	sampleRateIndex := (header[2] >> 2) & 0x03
	padding := (header[2] >> 1) & 0x01

	bitrate := bitrates[bitrateIndex] * 1000
	sampleRate := sampleRates[sampleRateIndex]

	if bitrate == 0 || sampleRate == 0 {
		return -1
	}

	// Формула для MPEG1 Layer III:
	frameLength := (144*bitrate)/sampleRate + int(padding)
	return frameLength
}

// Пропускаем ID3v2 тег, если он есть в начале
func skipID3Tag(r *bufio.Reader) error {
	header, err := r.Peek(10)
	if err != nil {
		if err == io.EOF {
			return nil
		}
		return err
	}
	if string(header[:3]) == "ID3" {
		// Размер тега в 4 байтах с семибитным кодированием
		size := int(header[6]&0x7F)<<21 |
			int(header[7]&0x7F)<<14 |
			int(header[8]&0x7F)<<7 |
			int(header[9]&0x7F)
		// Отбрасываем заголовок + тело тега
		_, err := r.Discard(10 + size)
		return err
	}
	return nil
}

func sliceMP3IntoFrames(data []byte) ([][]byte, error) {
	reader := bufio.NewReader(bytes.NewReader(data))

	if err := skipID3Tag(reader); err != nil {
		return nil, fmt.Errorf("ошибка пропуска ID3 тега: %w", err)
	}

	var frames [][]byte
	maxAttempts := 1 << 20
	attempts := 0

	for attempts < maxAttempts {
		attempts++

		header, err := reader.Peek(4)
		if err != nil {
			if err == io.EOF {
				break
			}
			return nil, fmt.Errorf("ошибка чтения заголовка: %w", err)
		}

		if !isMP3FrameHeader(header) {
			_, _ = reader.Discard(1)
			continue
		}

		frameSize := getMP3FrameSize(header)
		if frameSize <= 0 || frameSize > 4096 {
			_, _ = reader.Discard(1)
			continue
		}

		frame := make([]byte, frameSize)
		_, err = io.ReadFull(reader, frame)
		if err != nil {
			break
		}

		frames = append(frames, frame)
	}

	if attempts >= maxAttempts {
		return nil, fmt.Errorf("превышено максимальное количество попыток при поиске фреймов")
	}

	return frames, nil
}

func saveFramesToFile(username, trackID string, frames [][]byte) error {
	filePath := filepath.Join("songs", username, username+"-"+trackID)

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
		return fmt.Errorf("error saving mp3 frames: %v", err)
	}
	defer file.Close()

	for _, frame := range frames {
		err = binary.Write(file, binary.BigEndian, uint32(len(frame)))
		if err != nil {
			return fmt.Errorf("error saving len mp3 frames: %v", err)
		}

		_, err = file.Write(frame)
		if err != nil {
			return fmt.Errorf("error saving mp3 frame into file: %v", err)
		}
	}

	return nil
}

func openFramesFile(path string) ([][]byte, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("file opening error: %v", err)
	}

	var frames [][]byte

	for {
		var frameLen uint32
		err := binary.Read(file, binary.BigEndian, &frameLen)
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("ошибка чтения длины фрейма: %w", err)
		}

		frame := make([]byte, frameLen)
		if _, err := io.ReadFull(file, frame); err != nil {
			return nil, fmt.Errorf("ошибка чтения фрейма: %w", err)
		}

		frames = append(frames, frame)
	}

	return frames, nil
}

func getFramesFromTime(frames [][]byte, startTime float64, sampleRate int) ([][]byte, error) {
	if len(frames) == 0 {
		return nil, fmt.Errorf("frames slice is empty")
	}

	frameDuration := 1152.0 / float64(sampleRate)
	frameIndex := int(startTime / frameDuration)

	if frameIndex >= len(frames) {
		return nil, fmt.Errorf("start time is beyond audio length")
	}

	return frames[frameIndex:], nil
}

func durationDetermineADTS(aacADTS []byte, bitrate int) float64 {
	if bitrate <= 0 {
		return 0
	}
	bits := len(aacADTS) * 8
	duration := float64(bits) / float64(bitrate)
	return duration
}
