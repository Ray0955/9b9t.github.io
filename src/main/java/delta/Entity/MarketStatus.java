package delta.Entity;

import java.util.ArrayList;
import java.util.List;

public class MarketStatus {
    private boolean work = true;
    private List<String> protectedPaths = new ArrayList<>();

    public MarketStatus() {
        // Дефолтные защищенные пути
        this.protectedPaths.add("/9b9t");
        this.protectedPaths.add("/9b9t/cart");
        this.protectedPaths.add("/9b9t/checkout");
        this.protectedPaths.add("/9b9t/chat");
    }

    public MarketStatus(boolean work, List<String> protectedPaths) {
        this.work = work;
        this.protectedPaths = protectedPaths;
    }

    // Геттеры и сеттеры
    public boolean isWork() {
        return work;
    }

    public void setWork(boolean work) {
        this.work = work;
    }

    public List<String> getProtectedPaths() {
        return protectedPaths;
    }

    public void setProtectedPaths(List<String> protectedPaths) {
        this.protectedPaths = protectedPaths;
    }
}