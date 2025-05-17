package delta;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class HashUtil {
    public static String hashSHA256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(input.getBytes());

            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                hexString.append(String.format("%02x", b));
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Ошибка хеширования", e);
        }
    }

    public static void main(String[] args) {
        String login = "admin";
        String password = "admin123";

        String hashedLogin = hashSHA256(login);
        String hashedPassword = hashSHA256(password);

        System.out.println("Хеш логина: " + hashedLogin);
        System.out.println("Хеш пароля: " + hashedPassword);
    }
}

