package delta.Interceptors;

import delta.Entity.MarketStatus;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.servlet.HandlerInterceptor;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.io.*;

public class MaintenanceInterceptor implements HandlerInterceptor {
    private final Gson gson = new GsonBuilder().setPrettyPrinting().create();
    private final String filePath = "MarketStatus.json";

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {
        try {
            File file = new File(filePath);

            // Если файла нет - создаем с дефолтным статусом
            if (!file.exists()) {
                MarketStatus defaultStatus = new MarketStatus();
                saveStatusToFile(defaultStatus);
                return true;
            }

            // Читаем текущий статус
            MarketStatus status = readStatusFromFile();

            // Проверяем, нужно ли блокировать этот путь
            if (!status.isWork() && isProtectedPath(request.getRequestURI(), status)) {
                response.sendRedirect("/maintenance");
                return false;
            }

        } catch (Exception e) {
            e.printStackTrace();
            // В случае ошибки разрешаем доступ
        }
        return true;
    }

    private boolean isProtectedPath(String requestUri, MarketStatus status) {
        return status.getProtectedPaths().stream()
                .anyMatch(requestUri::startsWith);
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