package delta.Config;

import delta.Interceptors.MaintenanceInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.beans.factory.annotation.Value;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new MaintenanceInterceptor())
                .addPathPatterns("/9b9t/**", "/6b6t/**")
                .excludePathPatterns(
                        "/9b9t/maintenance",
                        "/6b6t/maintenance",
                        "/admin/**",
                        "/api/**",
                        "/css/**",
                        "/js/**",
                        "/images/**"
                )
                .order(1);
    }
}