package delta.Controllers;

import com.google.gson.Gson;
import delta.Entity.Order;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/{server}/orders")
@CrossOrigin(origins = "*") // Разрешаем запросы с фронтенда
public class OrderController {

    private final Gson gson = new Gson();

    @GetMapping
    public String getOrders(
            @PathVariable("server") String server,
            @RequestParam("login") String login,
            @RequestParam("password") String password
    ) {
        // Список администраторов и модераторов с их хэшами
        record User(String usernameHash, String passwordHash, String role, String server) {}

        User[] users = new User[]{
                new User("14019953baaf598284741f15d39ebad14c09e2e7d70e14240d22e09f1a542181",
                        "724ee8525fd528b8ac5ede40fd9fb15048b5c00e4c86a828b3641f80c27e3064",
                        "admin", "9b9t"),
                new User("3d56b9501bd6167bfdb96f72e2ffb09776c0678428ef3ed6b6b9e536447ebb56",
                        "e30bca7e270c84f10c531f8f999034f28799ef6a660d35e4cdb86a0246769474",
                        "moderator", "9b9t"),
                new User("adc32ec674a8e58e9b661856beb0db36ae2b542388800829700097ee5f37a3a1",
                        "de4455aa92230d8a2e8f061ac4170a0885c25c68f1684011a65fc88f9609f473",
                        "admin", "6b6t"),
                new User("adbacbf2fea81a2159eb2af9e2170fd018b85af23b4f3e06e3301b5af780f5b3",
                        "ecebff77ed41d1e51844be45c554804b56403861c4a9a251f5bacab358fd8903",
                        "moderator", "6b6t")
        };

        try {
            String loginHash = sha256(login);
            String passwordHash = sha256(password);

            for (User user : users) {
                if (user.usernameHash.equalsIgnoreCase(loginHash) &&
                        user.passwordHash.equalsIgnoreCase(passwordHash) &&
                        user.server.equalsIgnoreCase(server)) {

                    Order order = readOrdersFromJsonFile(server);
                    return gson.toJson(order.getOrders());
                }
            }
            return "{\"error\": \"Неверный логин или пароль, либо нет доступа к серверу\"}";

        } catch (Exception e) {
            e.printStackTrace();
            return "{\"error\": \"Ошибка сервера\"}";
        }
    }

    // Утилита для SHA-256
    private static String sha256(String input) throws Exception {
        java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(input.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }


    @GetMapping("/{id}")
    public String getOrderById(@PathVariable("server") String server, @PathVariable("id") UUID id) {
        Order order = readOrdersFromJsonFile(server);
        return order.getOrders().containsKey(id) ? gson.toJson(order.getOrders().get(id)) : "{\"error\": \"Заказ с таким ID не найден\"}";
    }

    @PutMapping("/{id}")
    public String updateOrder(@PathVariable("server") String server, @PathVariable("id") UUID id, @RequestBody Order.OrderContent updatedOrderContent) {
        Order currentOrder = readOrdersFromJsonFile(server);
        if (currentOrder.getOrders().containsKey(id)) {
            currentOrder.getOrders().put(id, updatedOrderContent);
            writeOrdersToJsonFile(server, currentOrder);
            return "{\"message\": \"Заказ обновлен\"}";
        }
        return "{\"error\": \"Заказ с таким ID не найден\"}";
    }

    @DeleteMapping("/{id}")
    public String deleteOrder(@PathVariable("server") String server, @PathVariable("id") UUID id) {
        Order currentOrder = readOrdersFromJsonFile(server);
        if (currentOrder.getOrders().containsKey(id)) {
            currentOrder.getOrders().remove(id);
            writeOrdersToJsonFile(server, currentOrder);
            return "{\"message\": \"Заказ удален\"}";
        }
        return "{\"error\": \"Заказ с таким ID не найден\"}";
    }

    @PostMapping
    public String addOrder(@PathVariable("server") String server, @RequestBody Order order) {
        Order currentOrder = readOrdersFromJsonFile(server);
        currentOrder.getOrders().putAll(order.getOrders());
        writeOrdersToJsonFile(server, currentOrder);
        return gson.toJson(order);
    }

    private Order readOrdersFromJsonFile(String server) {
        String jsonFilePath = getJsonFilePath(server);
        createJsonFileIfNotExists(jsonFilePath);

        try (Reader reader = new FileReader(jsonFilePath)) {
            return gson.fromJson(reader, Order.class);
        } catch (IOException e) {
            e.printStackTrace();
            return new Order(Map.of());
        }
    }

    private void writeOrdersToJsonFile(String server, Order order) {
        String jsonFilePath = getJsonFilePath(server);
        try (Writer writer = new FileWriter(jsonFilePath)) {
            gson.toJson(order, writer);
            writer.flush();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void createJsonFileIfNotExists(String jsonFilePath) {
        File file = new File(jsonFilePath);
        if (!file.exists()) {
            try {
                File parent = file.getParentFile();
                if (parent != null && !parent.exists()) {
                    parent.mkdirs();
                }
                if (file.createNewFile()) {
                    try (Writer writer = new FileWriter(file)) {
                        writer.write("{}");
                    }
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private String getJsonFilePath(String server) {
        String directoryPath = "data/" + server;
        File directory = new File(directoryPath);
        if (!directory.exists()) {
            directory.mkdirs(); // Создать папку, если её нет
        }
        return directoryPath + "/orders.json";
    }
}
