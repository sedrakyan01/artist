package Kafka

import (
	"context"
	"fmt"
	"github.com/IBM/sarama"
	"github.com/gorilla/websocket"
	"log"
)

var conn *websocket.Conn
var logger *log.Logger

func LoggerUpdater(loggerRecieved *log.Logger) {
	logger = loggerRecieved
}

func NewProducer(logger *log.Logger) (sarama.SyncProducer, error) {
	brokers := []string{"localhost:9092"}

	config := sarama.NewConfig()
	config.Producer.Return.Successes = true

	producer, err := sarama.NewSyncProducer(brokers, config)
	if err != nil {
		logger.Printf("Error creating the producer: %v\n", err)
		return nil, fmt.Errorf("Error creating the producer: %v\n", err)
	}

	return producer, nil
}

func SendMsg(producer sarama.SyncProducer, topic, msgText string, logger *log.Logger) (string, error) {
	msg := sarama.ProducerMessage{
		Topic: topic,
		Value: sarama.StringEncoder(msgText),
	}

	if producer == nil {
		fmt.Println("producer is nil")
		return "", fmt.Errorf("producer is nil")
	}

	partition, offset, err := producer.SendMessage(&msg)
	if err != nil {
		logger.Printf("Error sending message: %v\n", err)
		return "", fmt.Errorf("Error sending message: %v\n", err)
	}

	logger.Printf("Message sent to partition %d at offset %d\n", partition, offset)

	return fmt.Sprintf("Message %s sent to topic %s to partition %d\n", msg, topic, partition), nil
}

func Reader(topic string, logger *log.Logger) {
	brokers := []string{"localhost:9092"}

	config := sarama.NewConfig()

	consumer, err := sarama.NewConsumerGroup(brokers, "users_eventsID", config)
	if err != nil {
		logger.Printf("Error creating the consumer: %v\n", err)
	}
	defer consumer.Close()

	handler := ConsumerHandler{}
	for {
		err = consumer.Consume(context.Background(), []string{topic}, &handler)
		if err != nil {
			logger.Printf("Error from consumer: %v\n", err)
		}
	}
}

func ConnUpdater(connRecieved *websocket.Conn) {
	conn = connRecieved
}

type ConsumerHandler struct{}

func (ConsumerHandler) Setup(sarama.ConsumerGroupSession) error   { return nil }
func (ConsumerHandler) Cleanup(sarama.ConsumerGroupSession) error { return nil }
func (h ConsumerHandler) ConsumeClaim(session sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	// Читаем сообщения из топика
	for msg := range claim.Messages() {
		err := conn.WriteMessage(websocket.TextMessage, msg.Value)
		if err != nil {
			logger.Printf("Error sending message: %v\n", err)
			return fmt.Errorf("Error sending message: %v\n", err)
		}
		session.MarkMessage(msg, "") // Подтверждаем обработку
	}

	return nil
}
