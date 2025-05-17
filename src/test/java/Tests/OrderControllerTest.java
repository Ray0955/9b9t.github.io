package Tests;

import com.google.gson.Gson;
import delta.Entity.Order;
import delta.Entity.Product;
import delta.Main;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = Main.class)
@AutoConfigureMockMvc
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final Gson gson = new Gson();
    private Order.OrderContent testOrderContent;
    private UUID testOrderId;

    @BeforeEach
    void setUp() throws Exception {
        testOrderId = UUID.randomUUID();
        Random random = new Random();
        Map<String, String> info = Map.of("customer", "John Doe");
        Map<Long, Order.OrderContent.MessageContent> messages = Map.of(
                System.currentTimeMillis(),
                new Order.OrderContent.MessageContent("FADE365","Hello my friend"));

        Map<String, Integer> coordinates = Map.of("x", 100, "y", 200);

        testOrderContent = new Order.OrderContent();
        testOrderContent.setInfo(info)
                .setMessages(messages)
                .setCoordinates(coordinates)
                .setTotalPrice(100.0)
                .setProducts(Map.of(UUID.randomUUID(),random.nextInt(100)));

        mockMvc.perform(post("/api/9b9t/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(gson.toJson(Map.of(testOrderId, testOrderContent))))
                .andExpect(status().isOk());
    }


    @Test
    void testAddOrder() throws Exception {
        UUID newOrderId = UUID.randomUUID();
        String orderJson = gson.toJson(Map.of(newOrderId, testOrderContent));

        mockMvc.perform(post("/api/9b9t/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderJson))
                .andExpect(status().isOk());
    }

    @Test
    void testGetOrderById() throws Exception {
        mockMvc.perform(get("/api/9b9t/orders/" + testOrderId))
                .andExpect(status().isOk());
    }

    @Test
    void testUpdateOrder() throws Exception {
        testOrderContent.setTotalPrice(150.0);
        String updatedJson = gson.toJson(testOrderContent);

        mockMvc.perform(put("/api/9b9t/orders/" + testOrderId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedJson))
                .andExpect(status().isOk());
    }

    @Test
    void testDeleteOrder() throws Exception {
        mockMvc.perform(delete("/api/9b9t/orders/" + testOrderId))
                .andExpect(status().isOk());
    }
}