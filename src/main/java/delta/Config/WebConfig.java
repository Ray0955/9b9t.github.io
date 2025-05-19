
package delta.Config;

import delta.Interceptors.MaintenanceInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new MaintenanceInterceptor())
                .addPathPatterns("/**")
                .excludePathPatterns("/maintenance", "/css/**", "/js/**", "/images/**");
    }
}
