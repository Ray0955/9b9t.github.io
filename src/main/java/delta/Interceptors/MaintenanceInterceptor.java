package delta.Interceptors;

import delta.Entity.MarketStatus;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.servlet.HandlerInterceptor;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.io.*;
import java.util.List;

public class MaintenanceInterceptor implements HandlerInterceptor {
    private final Gson gson = new GsonBuilder().setPrettyPrinting().create();
    private final String filePath = "MarketStatus.json";

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {
        try {
            String requestUri = request.getRequestURI();
            String server = determineServer(requestUri);

            if (server == null) {
                return true; // Не относится к конкретному серверу
            }

            MarketStatus status = readStatusFromFile();

            if (status.isWork(server)){
                List<String> protectedPaths = status.getProtectedPaths(server);
                if (protectedPaths.stream().anyMatch(requestUri::startsWith)) {
                    response.sendRedirect("/" + server + "/maintenance");
                    return false;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return true;
    }

    private String determineServer(String requestUri) {
        if (requestUri.startsWith("/9b9t")) {
            return "9b9t";
        } else if (requestUri.startsWith("/6b6t")) {
            return "6b6t";
        }
        return null;
    }

    private MarketStatus readStatusFromFile() throws IOException {
        File file = new File(filePath);
        if (!file.exists()) {
            return new MarketStatus();
        }

        try (Reader reader = new FileReader(file)) {
            return gson.fromJson(reader, MarketStatus.class);
        }
    }
}