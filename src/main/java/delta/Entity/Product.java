package delta.Entity;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import delta.Serializers.UUIDKeyDeserializer;
import delta.Serializers.UUIDKeySerializer;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class Product {
    @JsonSerialize(keyUsing = UUIDKeySerializer.class)
    @JsonDeserialize(keyUsing = UUIDKeyDeserializer.class)

    private Map<UUID, ProductContent> products = new HashMap<>();

    public Product(Map<UUID, ProductContent> products) {
        this.products = products;
    }

    public Product() {}

    public Map<UUID, ProductContent> getProducts() {return this.products;}
    public void setProducts(Map<UUID, ProductContent> products) {this.products = products;}

    public static class ProductContent {
        private String category;
        private boolean isNew;
        private boolean isAvailable;
        private Map<String, String> title; // Название товара в разных языках
        private Map<String, String> description; // Описание товара в разных языках
        private double price;
        private String imageUrl;

        public ProductContent() {}

        public ProductContent(String category,
                       boolean isNew,
                       boolean isAvailable,
                       Map<String, String> title,
                       Map<String, String> description,
                       double price,
                       String imageUrl) {

            this.category = category;
            this.isNew = isNew;
            this.isAvailable = isAvailable;
            this.title = title;
            this.description = description;
            this.price = price;
            this.imageUrl = imageUrl;
        }

        public String getCategory() {return this.category;}
        public boolean getIsNew() {return this.isNew;}
        public boolean getIsAvailable() {return this.isAvailable;}
        public Map<String, String> getTitle() {return this.title;}
        public Map<String, String> getDescription() {return this.description;}
        public double getPrice() {return this.price;}
        public String getImageUrl() {return this.imageUrl;}

        public ProductContent setCategory(String category) {this.category = category; return this;}
        public ProductContent setIsNew(boolean state) {this.isNew = state; return this;}
        public ProductContent setIsAvailable(boolean state) {this.isAvailable = state; return this;}
        public ProductContent setTitle(Map<String, String> title) {this.title = title; return this;}
        public ProductContent setDescription(Map<String, String> description) {this.description = description; return this;}
        public ProductContent setPrice(double price) {this.price = price; return this;}
        public ProductContent setImageUrl(String imageUrl) {this.imageUrl = imageUrl; return this;}
    }

}
