package delta;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.github.javafaker.Faker;
import delta.Entity.Promo;

import java.io.FileWriter;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

public class PromoDataGenerator {

    public static void main(String[] args) {
        // Создание тестовых промокодов
        Map<String, Promo.PromoContent> promocodeMap = new HashMap<>();

        Random random = new Random();
        Faker faker = new Faker();

        // Сколько промокодов сгенерировать
        int promoCount = random.nextInt(20) + 5; // от 5 до 25

        for (int i = 0; i < promoCount; i++) {
            String code = faker.bothify("PROMO-????-####");

            Promo.PromoContent promoContent = new Promo.PromoContent()
                    .setType(randomPromoType())
                    .setValue(random.nextDouble() * 100) // скидка от 0 до 100
                    .setMinOrder(random.nextDouble() * 500) // мин заказ от 0 до 500
                    .setMaxUses(random.nextBoolean() ? random.nextInt(100) : null) // иногда без ограничений
                    .setIsActive(random.nextBoolean())
                    .setTarget(randomCategory())
                    .setUsedCount(random.nextInt(50))
                    .setCreatedAt(java.time.LocalDateTime.now().toString());

            promocodeMap.put(code, promoContent);
        }

        Promo promo = new Promo();
        promo.setPromocodes(promocodeMap);

        // Сериализация в JSON
        Gson gson = new GsonBuilder().setPrettyPrinting().create();

        try (FileWriter writer = new FileWriter("test_promo.json")) {
            gson.toJson(promo, writer);
            System.out.println("Тестовый JSON-файл успешно создан: test_promo.json");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static String randomPromoType() {
        String[] types = {"percentage", "fixed", "free_shipping", "gift"};
        return types[new Random().nextInt(types.length)];
    }

    private static String randomCategory() {
        String[] categories = {"electronics", "clothing", "books", "games", "home", "beauty"};
        return categories[new Random().nextInt(categories.length)];
    }
}
