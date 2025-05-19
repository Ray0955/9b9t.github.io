package delta.Controllers;

import delta.Entity.MarketStatus;
import org.springframework.web.bind.annotation.*;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.io.*;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {
    private final Gson gson = new GsonBuilder().setPrettyPrinting().create();
    private final String filePath = "MarketStatus.json";
    private final String API_SECRET = ""; // Ваш секретный ключ

    @PostMapping("/toggle")
    public String toggleMaintenance(
            @RequestBody MarketStatus status,
            @RequestHeader("X-API-Secret") String clientSecret
    ) {
        if (!API_SECRET.equals(clientSecret)) {
            throw new SecurityException("Invalid API secret");
        }

        try {
            try (FileWriter writer = new FileWriter(filePath)) {
                gson.toJson(status, writer);
            }
            return "Статус техработ успешно обновлен";
        } catch (Exception e) {
            e.printStackTrace();
            return "Ошибка при обновлении статуса";
        }
    }

    @GetMapping("/status")
    public MarketStatus getStatus(@RequestHeader("X-API-Secret") String clientSecret) throws IOException {
        if (!API_SECRET.equals(clientSecret)) {
            throw new SecurityException("Invalid API secret");
        }

        File file = new File(filePath);
        if (!file.exists()) {
            return new MarketStatus();
        }

        try (Reader reader = new FileReader(file)) {
            return gson.fromJson(reader, MarketStatus.class);
        }
    }
}