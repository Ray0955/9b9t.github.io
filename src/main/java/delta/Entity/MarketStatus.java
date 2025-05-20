package delta.Entity;

import java.util.ArrayList;
import java.util.List;

public class MarketStatus {
    private boolean work9b9t = false; // по умолчанию техработы выключены
    private boolean work6b6t = false; // по умолчанию техработы выключены
    private List<String> protectedPaths9b9t = new ArrayList<>();
    private List<String> protectedPaths6b6t = new ArrayList<>();

    public MarketStatus() {
        // Дефолтные защищенные пути для 9b9t
        this.protectedPaths9b9t.add("/9b9t");
        this.protectedPaths9b9t.add("/9b9t/cart");
        this.protectedPaths9b9t.add("/9b9t/checkout");
        this.protectedPaths9b9t.add("/9b9t/chat");

        // Дефолтные защищенные пути для 6b6t
        this.protectedPaths6b6t.add("/6b6t");
        this.protectedPaths6b6t.add("/6b6t/cart");
        this.protectedPaths6b6t.add("/6b6t/checkout");
        this.protectedPaths6b6t.add("/6b6t/chat");
    }

    // Геттеры и сеттеры
    public boolean isWork9b9t() {
        return work9b9t;
    }

    public void setWork9b9t(boolean work9b9t) {
        this.work9b9t = work9b9t;
    }

    public boolean isWork6b6t() {
        return work6b6t;
    }

    public void setWork6b6t(boolean work6b6t) {
        this.work6b6t = work6b6t;
    }

    public List<String> getProtectedPaths9b9t() {
        return protectedPaths9b9t;
    }

    public void setProtectedPaths9b9t(List<String> protectedPaths9b9t) {
        this.protectedPaths9b9t = protectedPaths9b9t;
    }

    public List<String> getProtectedPaths6b6t() {
        return protectedPaths6b6t;
    }

    public void setProtectedPaths6b6t(List<String> protectedPaths6b6t) {
        this.protectedPaths6b6t = protectedPaths6b6t;
    }

    public boolean isWork(String server) {
        return false;
    }

    public List<String> getProtectedPaths(String server) {
        return List.of();
    }
}