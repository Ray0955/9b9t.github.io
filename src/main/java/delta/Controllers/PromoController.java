package delta.Controllers;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import delta.Entity.Promo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/{server}/promocodes")
@CrossOrigin(origins = "*")
public class PromoController {
    private final Gson gson = new GsonBuilder().setPrettyPrinting().create();

    @GetMapping
    public ResponseEntity<?> getAllPromocodes(@PathVariable("server") String server) {
        try {
            Promo promo = readPromocodesFromFile(server);
            return ResponseEntity.ok(promo.getPromocodes());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(errorResponse(
                    "Ошибка при получении промокодов",
                    e.getMessage()
            ));
        }
    }

    @GetMapping("/{code}")
    public ResponseEntity<?> getPromoByCode(
            @PathVariable("server") String server,
            @PathVariable("code") String code) {

        try {
            Promo promo = readPromocodesFromFile(server);
            Promo.PromoContent content = promo.getPromocodes().get(code.toUpperCase());

            if (content == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(content);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(errorResponse(
                    "Ошибка при получении промокода",
                    e.getMessage()
            ));
        }
    }

    @PostMapping
    public ResponseEntity<?> createPromocode(
            @PathVariable("server") String server,
            @RequestBody Map<String, Promo.PromoContent> promos) {

        try {
            Promo promo = readPromocodesFromFile(server);

            // Валидация и добавление промокодов
            promos.forEach((code, content) -> {
                validatePromoContent(content);
                promo.addPromocode(code.toUpperCase(), content);
            });

            writePromocodesToFile(server, promo);
            return ResponseEntity.ok(promo.getPromocodes());

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorResponse(
                    "Неверные данные промокода",
                    e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(errorResponse(
                    "Ошибка при создании промокода",
                    e.getMessage()
            ));
        }
    }

    @PutMapping("/{code}")
    public ResponseEntity<?> updatePromocode(
            @PathVariable("server") String server,
            @PathVariable("code") String code,
            @RequestBody Promo.PromoContent newContent) {

        try {
            Promo promo = readPromocodesFromFile(server);
            code = code.toUpperCase();

            if (!promo.getPromocodes().containsKey(code)) {
                return ResponseEntity.notFound().build();
            }

            validatePromoContent(newContent);
            promo.updatePromocode(code, newContent);
            writePromocodesToFile(server, promo);

            return ResponseEntity.ok(promo.getPromocodes().get(code));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorResponse(
                    "Неверные данные промокода",
                    e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(errorResponse(
                    "Ошибка при обновлении промокода",
                    e.getMessage()
            ));
        }
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<?> deletePromocode(
            @PathVariable("server") String server,
            @PathVariable("code") String code) {

        try {
            Promo promo = readPromocodesFromFile(server);
            code = code.toUpperCase();

            if (!promo.getPromocodes().containsKey(code)) {
                return ResponseEntity.notFound().build();
            }

            promo.removePromocode(code);
            writePromocodesToFile(server, promo);

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Промокод удален",
                    "code", code
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(errorResponse(
                    "Ошибка при удалении промокода",
                    e.getMessage()
            ));
        }
    }

    // Вспомогательные методы
    private void validatePromoContent(Promo.PromoContent content) {
        if (content.getType() == null) {
            throw new IllegalArgumentException("Тип промокода обязателен");
        }

        // Проверка значений в зависимости от типа
        switch (content.getType()) {
            case "percentage":
                if (content.getValue() == null || content.getValue() <= 0 || content.getValue() > 100) {
                    throw new IllegalArgumentException("Процентная скидка должна быть от 1 до 100");
                }
                break;
            case "fixed":
                if (content.getValue() == null || content.getValue() <= 0) {
                    throw new IllegalArgumentException("Фиксированная скидка должна быть больше 0");
                }
                break;
            case "item_discount":
                if (content.getTarget() == null || content.getTarget().isEmpty()) {
                    throw new IllegalArgumentException("Для скидки на товар необходимо указать target");
                }
                break;
        }
    }

    private Promo readPromocodesFromFile(String server) throws IOException {
        String path = getFilePath(server);
        createFileIfNotExists(path);

        try (Reader reader = Files.newBufferedReader(Paths.get(path))) {
            Promo promo = gson.fromJson(reader, Promo.class);
            return promo != null ? promo : new Promo();
        }
    }

    private void writePromocodesToFile(String server, Promo promo) throws IOException {
        String path = getFilePath(server);
        try (Writer writer = Files.newBufferedWriter(Paths.get(path))) {
            gson.toJson(promo, writer);
        }
    }

    private void createFileIfNotExists(String path) throws IOException {
        File file = new File(path);
        if (!file.exists()) {
            file.getParentFile().mkdirs();
            try (Writer writer = Files.newBufferedWriter(Paths.get(path))) {
                writer.write("{}");
            }
        }
    }

    private String getFilePath(String server) {
        return "data/" + server + "/promocodes.json";
    }

    private Map<String, Object> errorResponse(String error, String details) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", error);
        response.put("details", details);
        response.put("timestamp", LocalDateTime.now().toString());
        return response;
    }
}