package delta.Entity;

import java.util.HashMap;
import java.util.Map;

public class Promo {
    private Map<String, PromoContent> promocodes = new HashMap<>();

    public static class PromoContent {
        private String type; // "percentage", "fixed", "free_shipping" и т.д.
        private Double value; // Значение скидки
        private Double minOrder = 0.0; // Минимальная сумма заказа
        private Integer maxUses; // Максимальное количество использований (null - без ограничений)
        private Boolean isActive = true; // Активен ли промокод
        private String target; // Для каких товаров/категорий применяется
        private Integer usedCount = 0; // Сколько раз использован
        private String createdAt; // Дата создания

        // Геттеры и сеттеры
        public String getType() { return type; }
        public PromoContent setType(String type) { this.type = type; return this; }

        public Double getValue() { return value; }
        public PromoContent setValue(Double value) { this.value = value; return this; }

        public Double getMinOrder() { return minOrder; }
        public PromoContent setMinOrder(Double minOrder) { this.minOrder = minOrder; return this; }

        public Integer getMaxUses() { return maxUses; }
        public PromoContent setMaxUses(Integer maxUses) { this.maxUses = maxUses; return this; }

        public Boolean getIsActive() { return isActive; }
        public PromoContent setIsActive(Boolean isActive) { this.isActive = isActive; return this; }

        public String getTarget() { return target; }
        public PromoContent setTarget(String target) { this.target = target; return this; }

        public Integer getUsedCount() { return usedCount; }
        public PromoContent setUsedCount(Integer usedCount) { this.usedCount = usedCount; return this; }

        public String getCreatedAt() { return createdAt; }
        public PromoContent setCreatedAt(String createdAt) { this.createdAt = createdAt; return this; }
    }

    // Методы для работы с промокодами
    public Map<String, PromoContent> getPromocodes() { return promocodes; }
    public Promo setPromocodes(Map<String, PromoContent> promocodes) { this.promocodes = promocodes; return this; }

    public Promo addPromocode(String code, PromoContent content) {
        if (content.getCreatedAt() == null) {
            content.setCreatedAt(java.time.LocalDateTime.now().toString());
        }
        this.promocodes.put(code, content);
        return this;
    }

    public Promo removePromocode(String code) {
        this.promocodes.remove(code);
        return this;
    }

    public Promo updatePromocode(String code, PromoContent newContent) {
        if (promocodes.containsKey(code)) {
            PromoContent existing = promocodes.get(code);
            // Сохраняем неизменяемые поля
            newContent.setUsedCount(existing.getUsedCount());
            newContent.setCreatedAt(existing.getCreatedAt());
            promocodes.put(code, newContent);
        }
        return this;
    }
}