package delta.Interceptors;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import delta.Entity.MarketStatus;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jetbrains.annotations.NotNull;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.*;

public class MaintenanceInterceptor implements HandlerInterceptor {

    private final Gson gson = new GsonBuilder().setPrettyPrinting().create();
    private final String filePath = "MarketStatus.json";

    @Override
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
