package delta;

import com.google.gson.Gson;
import delta.Entity.Product;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.ApplicationRunner;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;

@Configuration
public class DataLoader {

    private final String jsonFilePath = "products.json"; // Укажи путь к файлу
    private final Gson gson = new Gson();

    @Bean
    ApplicationRunner init() {
        return args -> {
            File file = new File(jsonFilePath);

            // Если файла нет — создаем и записываем дефолтные продукты
            if (!file.exists()) {
                try (FileWriter writer = new FileWriter(file)) {
                    gson.toJson("[]", writer);
                    System.out.println("JSON файл с продуктами создан.");
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        };
    }
}
