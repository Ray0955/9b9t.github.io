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
                        "3e46859fa2e5dd9fbc5b3236db82df934ad3c015a76788374e1ac66e44b3e705",
                        "admin", "9b9t"),
                new User("3d56b9501bd6167bfdb96f72e2ffb09776c0678428ef3ed6b6b9e536447ebb56",
                        "8d67604ed0513c8dd462ae6e8af9660ff228c42f47bd274f84792860da7ff38f",
                        "moderator", "9b9t"),

                new User("0316c5640787d0af725750c238d04b0c00001adc741770c7addf40dec63b897f",
                        "5ffb5169712025e5ba4ab31080c1d0cee7e4276a6eefd83e14a8414e9fde7957",
                        "admin", "2b2t"),
                new User("adbacbf2fea81a2159eb2af9e2170fd018b85af23b4f3e06e3301b5af780f5b3",
                        "f99f0ebff2e737110b18a67c2d2dfca460f65803b48a925cec2f720acf272680",
                        "moderator", "2b2t"),

                new User("adc32ec674a8e58e9b661856beb0db36ae2b542388800829700097ee5f37a3a1",
                        "fdfb9bd8baee856cb224e684949703502c65882408448fab07fe800356e0ccd3",
                        "admin", "6b6t"),
                new User("57b90d4355574b11a27abc7ae75417e3158106d730a74f86f47441681484c46b",
                        "a5fc5a09d1845c023b90cd1c7553b10be6e439a6660a0309a75e0289cbb6222e",
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
