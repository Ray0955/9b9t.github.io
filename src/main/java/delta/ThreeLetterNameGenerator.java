package delta;

public class ThreeLetterNameGenerator {
    public static void main(String[] args) {
        char[] letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".toCharArray();

        for (char first : letters) {
            for (char second : letters) {
                for (char third : letters) {
                    String name = "" + first + second + third;
                    System.out.println(name);
                }
            }
        }
    }
}

