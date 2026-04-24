package com.learngrid.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class FileServingConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded note PDFs from the local ./uploads/notes/ directory
        registry.addResourceHandler("/uploads/notes/**")
                .addResourceLocations("file:./uploads/notes/");
    }
}
