package delta;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import delta.Entity.Order;

import java.io.FileWriter;
import com.github.javafaker.Faker;
import java.io.IOException;
import java.util.*;

public class OrderDataGenerator {

    public static void main(String[] args) {
        // Создание тестового заказа
        Map<UUID, Order.OrderContent> orderMap = new HashMap<>();
        Map<UUID, Integer> products = new HashMap<>();
        Map<Long, Order.OrderContent.MessageContent> messages = new HashMap<>();

        Random random = new Random();
        Faker faker = new Faker();

        for (int i=0;i<random.nextInt(100);i++) {
            products.put(UUID.randomUUID(),new Random().nextInt(100));
        }
        for (int i=0;i< random.nextInt(50);i++) {
            messages.put(
                    System.currentTimeMillis(),
                    new Order.OrderContent.MessageContent(faker.name().username(),faker.lorem().sentence())
            );
        }

        Order.OrderContent orderContent = new Order.OrderContent()
                .setInfo(Map.of("username", faker.name().fullName(),
                        "discord", faker.name().username(),
                        "email", faker.internet().emailAddress(),
                        "deliveryMethod", "Fast Delivery"))
                .setCoordinates(Map.of(
                        "x", random.nextInt(30000000),
                        "y", random.nextInt(30000000),
                        "z", random.nextInt(30000000)))
                .setTotalPrice(random.nextInt(1000))
                .setMessages(messages)
                .setProducts(products); // Добавляем продукты в заказ

        orderMap.put(UUID.randomUUID(), orderContent);

        Order order = new Order(orderMap);

        // Создание экземпляра Gson
        Gson gson = new GsonBuilder().setPrettyPrinting().create();

        // Запись в JSON-файл
        try (FileWriter writer = new FileWriter("test_order.json")) {
            gson.toJson(order, writer);
            System.out.println("Тестовый JSON-файл успешно создан: test_order.json");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
