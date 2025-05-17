package delta.Entity;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import delta.Serializers.UUIDKeyDeserializer;
import delta.Serializers.UUIDKeySerializer;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class Order {
    @JsonSerialize(keyUsing = UUIDKeySerializer.class)
    @JsonDeserialize(keyUsing = UUIDKeyDeserializer.class)

    private Map<UUID, OrderContent> orders = new HashMap<>();// Инициализируем Map

    public Order() {}
    public Order(Map<UUID, OrderContent> order) {
        this.orders = order;
    }

    public Map<UUID, OrderContent> getOrders() {return orders;}

    public void setOrders(Map<UUID, OrderContent> orders) {this.orders = orders;}

    public static class OrderContent {
        private double totalPrice;
        private Map<String, String> info;
        private Map<Long, MessageContent> messages;
        private Map<String, Integer> coordinates;
        private Map<UUID, Integer> products;

        public OrderContent() {}

        // Геттеры
        public double getTotalPrice() {return totalPrice;}
        public Map<String, String> getInfo() {return info;}
        public Map<Long, MessageContent> getMessages() {return messages;}
        public Map<String, Integer> getCoordinates() {return coordinates;}
        public Map<UUID, Integer> getProducts() {return products;}

        // Сеттеры
        public OrderContent setTotalPrice(double totalPrice) {this.totalPrice = totalPrice;return this;}
        public OrderContent setInfo(Map<String, String> info) {this.info = info; return this;}
        public OrderContent setMessages(Map<Long, MessageContent> msg) {this.messages = msg;return this;}
        public OrderContent setCoordinates(Map<String, Integer> coordinates) {this.coordinates = coordinates;return this;}
        public OrderContent setProducts(Map<UUID, Integer> products) {this.products = products;return this;}

        public static class MessageContent {
            private String author;
            private String message;
            public MessageContent(){}
            public MessageContent(String author, String message) {
                this.author = author;
                this.message = message;
            }
            //getters
            public String getAuthor() {return this.author;}
            public String getMessage() {return message;}

            //setters
            public MessageContent setAuthor(String author) {this.author = author; return this;}
            public MessageContent setMessage(String message) {this.message = message; return this;}
        }
    }
}
