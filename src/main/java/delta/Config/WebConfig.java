package delta.Config;

import delta.Interceptors.MaintenanceInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.beans.factory.annotation.Value;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${maintenance.protected.paths:/9b9t,/9b9t/cart,/9b9t/checkout,/9b9t/chat}")
    private String[] protectedPaths;

    @Value("${maintenance.excluded.paths:/maintenance,/admin/**,/api/**,/css/**,/js/**,/images/**}")
    private String[] excludedPaths;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Включение логирования при старте
        logInterceptorConfiguration();

        registry.addInterceptor(new MaintenanceInterceptor())
                .addPathPatterns(protectedPaths)
                .excludePathPatterns(excludedPaths)
                .order(1); // Высокий приоритет
    }

    private void logInterceptorConfiguration() {
        System.out.println("\n=== Maintenance Interceptor Configuration ===");
        System.out.println("Protected paths: ");
        for (String path : protectedPaths) {
            System.out.println("  - " + path);
        }
        System.out.println("\nExcluded paths: ");
        for (String path : excludedPaths) {
            System.out.println("  - " + path);
        }
        System.out.println("=========================================\n");
    }
}