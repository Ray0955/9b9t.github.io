package delta.Controllers;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import delta.Entity.Product;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.util.*;

@RestController
@RequestMapping("/api/{server}/products")
@CrossOrigin(origins = "*")
public class ProductController {
    private final Gson gson = new GsonBuilder().setPrettyPrinting().create();
    private Map<UUID, Product.ProductContent> products = new HashMap<>();

    @GetMapping
    public String getProducts(@PathVariable("server") String server) {
        loadProducts(server);
        return gson.toJson(products);
    }

    @GetMapping("/{id}")
    public String getProductById(@PathVariable("server") String server, @PathVariable("id") UUID id) {
        loadProducts(server);
        Product.ProductContent product = products.get(id);
        return (product != null) ? gson.toJson(product) : "{\"error\": \"Продукт с таким ID не найден\"}";
    }

    @PostMapping
    public String addProduct(@PathVariable("server") String server, @RequestBody Product product) {
        if (product.getProducts().isEmpty()) {
            return "{\"error\": \"Продукт должен содержать хотя бы один элемент\"}";
        }

        loadProducts(server);
        products.putAll(product.getProducts());
        saveProducts(server);
        return gson.toJson(product.getProducts());
    }

    @PutMapping("/{id}")
    public String updateProduct(@PathVariable("server") String server, @PathVariable("id") UUID id, @RequestBody Product.ProductContent updatedProduct) {
        loadProducts(server);
        if (!products.containsKey(id)) {
            return "{\"error\": \"Товар с таким ID не найден\"}";
        }
        products.put(id, updatedProduct);
        saveProducts(server);
        return gson.toJson(updatedProduct);
    }

    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable("server") String server, @PathVariable("id") UUID id) {
        loadProducts(server);
        if (products.remove(id) != null) {
            saveProducts(server);
            return "{\"message\": \"Товар удален\"}";
        } else {
            return "{\"error\": \"Товар с таким ID не найден\"}";
        }
    }

    private void loadProducts(String server) {
        String jsonFilePath = getJsonFilePath(server);
        File file = new File(jsonFilePath);
        if (!file.exists()) {
            saveProducts(server);
            return;
        }

        try (Reader reader = new FileReader(jsonFilePath)) {
            Product product = gson.fromJson(reader, Product.class);
            products = (product != null && product.getProducts() != null) ? product.getProducts() : new HashMap<>();
        } catch (IOException e) {
            e.printStackTrace();
            products = new HashMap<>();
        }
    }

    private void saveProducts(String server) {
        String jsonFilePath = getJsonFilePath(server);
        try (Writer writer = new FileWriter(jsonFilePath)) {
            gson.toJson(new Product(products), writer);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private String getJsonFilePath(String server) {
        String directoryPath = "data/" + server;
        File directory = new File(directoryPath);
        if (!directory.exists()) {
            directory.mkdirs(); // Создать папку, если её нет
        }
        return directoryPath + "/products.json";
    }
}
