package delta.Serializers;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import java.io.IOException;
import java.util.UUID;

public class UUIDKeySerializer extends JsonSerializer<UUID> {
    @Override
    public void serialize(UUID value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        gen.writeString(value.toString()); // Преобразуем UUID в строку
    }
}
