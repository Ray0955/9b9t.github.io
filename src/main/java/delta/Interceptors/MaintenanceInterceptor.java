package delta.Interceptors;

<<<<<<< HEAD
import delta.Entity.MarketStatus;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.servlet.HandlerInterceptor;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.io.*;

public class MaintenanceInterceptor implements HandlerInterceptor {
=======
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import delta.Entity.MarketStatus;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jetbrains.annotations.NotNull;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.*;

public class MaintenanceInterceptor implements HandlerInterceptor {

>>>>>>> 576c3fd7322332020d4f3b51206c153ff109ded1
    private final Gson gson = new GsonBuilder().setPrettyPrinting().create();
    private final String filePath = "MarketStatus.json";

    @Override
<<<<<<< HEAD
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
=======
    public boolean preHandle(@NotNull HttpServletRequest request,
                             @NotNull HttpServletResponse response,
                             @NotNull Object handler) throws Exception {
        try {
            File file = new File(filePath);
            if (!file.exists()) {
                // Если файл не существует — создаём с "work: true"
                MarketStatus defaultStatus = new MarketStatus(true);
                try (FileWriter writer = new FileWriter(file)) {
                    gson.toJson(defaultStatus, writer);
                }
            }

            // Чтение файла
            try (Reader reader = new FileReader(file)) {
                MarketStatus status = gson.fromJson(reader, MarketStatus.class);
                if (!status.isWork() && !request.getRequestURI().equals("/maintenance")) {
                    response.sendRedirect("/maintenance");
                    return false;
                }
            }

        } catch (Exception e) {
            e.printStackTrace(); // Можно заменить логгером
        }

        return true;
    }
}
>>>>>>> 576c3fd7322332020d4f3b51206c153ff109ded1
