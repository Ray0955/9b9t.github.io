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
@CrossOrigin(origins = {"https://endles.fun"})
public class MaintenanceController {
    private final Gson gson = new GsonBuilder().setPrettyPrinting().create();
    private final String filePath = "MarketStatus.json";
    private final String API_SECRET = "test"; // Ваш секретный ключ

    @PostMapping("/toggle")
    public String toggleMaintenance(
            @RequestBody MarketStatus status,
            @RequestHeader("X-API-Secret") String clientSecret,
            @RequestParam String server
    ) {
        if (!API_SECRET.equals(clientSecret)) {
            throw new SecurityException("Invalid API secret");
        }

        try {
            MarketStatus currentStatus = readStatusFromFile();

            if ("9b9t".equals(server)) {
                currentStatus.setWork9b9t(status.isWork9b9t());
            } else if ("6b6t".equals(server)) {
                currentStatus.setWork6b6t(status.isWork6b6t());
            }

            saveStatusToFile(currentStatus);
            return "Статус техработ для сервера " + server + " успешно обновлен";
        } catch (Exception e) {
            e.printStackTrace();
            return "Ошибка при обновлении статуса";
        }
    }

    @GetMapping("/status")
    public MarketStatus getStatus(
            @RequestHeader("X-API-Secret") String clientSecret,
            @RequestParam String server
    ) throws IOException {
        if (!API_SECRET.equals(clientSecret)) {
            throw new SecurityException("Invalid API secret");
        }

        File file = new File(filePath);
        if (!file.exists()) {
            return new MarketStatus();
        }

        MarketStatus status = readStatusFromFile();
        MarketStatus response = new MarketStatus();

        if ("9b9t".equals(server)) {
            response.setWork9b9t(status.isWork9b9t());
            response.setProtectedPaths9b9t(status.getProtectedPaths9b9t());
        } else if ("6b6t".equals(server)) {
            response.setWork6b6t(status.isWork6b6t());
            response.setProtectedPaths6b6t(status.getProtectedPaths6b6t());
        }

        return response;
    }

    private MarketStatus readStatusFromFile() throws IOException {
        try (Reader reader = new FileReader(filePath)) {
            return gson.fromJson(reader, MarketStatus.class);
        }
    }

    private void saveStatusToFile(MarketStatus status) throws IOException {
        try (FileWriter writer = new FileWriter(filePath)) {
            gson.toJson(status, writer);
        }
    }
}