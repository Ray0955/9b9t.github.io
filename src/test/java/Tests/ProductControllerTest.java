package Tests;

import com.google.gson.Gson;
import delta.Entity.Product;
import delta.Main;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = Main.class)
@AutoConfigureMockMvc
@ComponentScan("delta")
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final Gson gson = new Gson();
    private Product testProduct;
    private UUID testId;

    @BeforeEach
    void setUp() {
        testId = UUID.randomUUID();
        Map<String, String> title = Map.of("RU", "Test title");
        Map<String, String> description = Map.of("RU", "Test description");
        Product.ProductContent content = new Product.ProductContent(
                "block", true,true, title, description, 39.99,
                "https://upload.wikimedia.org/wikipedia/commons/b/bd/Test.svg"
        );

        testProduct = new Product(Map.of(testId,content));

    }

    @Test
    void testGetProducts() throws Exception {
        mockMvc.perform(get("/api/9b9t/products"))
                .andExpect(status().isOk());
    }

    @Test
    void testAddProduct() throws Exception {
        String productJson = gson.toJson(testProduct);

        mockMvc.perform(post("/api/9b9t/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productJson))
                .andExpect(status().isOk());
    }

    @Test
    void testGetProductById() throws Exception {
        mockMvc.perform(get("/api/9b9t/products/" + testId))
                .andExpect(status().isOk());
    }

    @Test
    void testUpdateProduct() throws Exception {
        testProduct.getProducts().get(testId).setPrice(150);
        String updatedJson = gson.toJson(testProduct);

        mockMvc.perform(put("/api/9b9t/products/" + testId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedJson))
                .andExpect(status().isOk());
    }

    @Test
    void testDeleteProduct() throws Exception {
        mockMvc.perform(delete("/api/9b9t/products/" + testId))
                .andExpect(status().isOk());
    }
}
