package delta.Controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class PageController {

    // Общие страницы
    @GetMapping("/")
    public String home(Model model) {
        return "index";
    }
    @GetMapping("/admin/admin")
    public String getAdmin(Model model) {
        return "admin/admin";
    }

    @GetMapping("/fe/failure")
    public String getFailure(Model model) {
        return "fe/failure";
    }


    @GetMapping({"/status.php", "/status.html"})
    public String getStatus(Model model) {
        model.addAttribute("status", "Online");
        model.addAttribute("serverTime", new java.util.Date());
        model.addAttribute("version", "1.0.0");
        return "status";
    }



    @GetMapping("/su/success")
    public String getSuccess(Model model) {
        return "su/success";
    }

    // 9b9t раздел
    @GetMapping("/9b9t")
    public String get9b9tMain(Model model) {
        return "9b9t/index";
    }

    @GetMapping("/9b9t/cart")
    public String get9b9tCart(Model model) {
        return "9b9t/cart";
    }

    @GetMapping("/9b9t/checkout")
    public String get9b9tCheckout(Model model) {
        return "9b9t/checkout";
    }

    @GetMapping("/9b9t/chat")
    public String get9b9tChat(Model model) {
        return "9b9t/chat";
    }
    // 6b6t раздел
    @GetMapping("/6b6t")
    public String get6b6tMain(Model model) {
        return "6b6t/6b6t";
    }
    @GetMapping("/6b6t/cart")
    public String get6b6tCart(Model model) {
        return "6b6t/cart";
    }

    @GetMapping("/6b6t/checkout")
    public String get6b6tCheckout(Model model) {
        return "6b6t/checkout";
    }

    @GetMapping("/6b6t/chat")
    public String get6b6tChat(Model model) {
        return "6b6t/chat";
    }





    // 2b2t раздел
    @GetMapping("/2b2t")
    public String get2b2tMain(Model model) {
        return "2b2t/2b2t";
    }

    @GetMapping("/2b2t/cart")
    public String get2b2tCart(Model model) {
        return "2b2t/cart";
    }

    @GetMapping("/2b2t/checkout")
    public String get2b2tCheckout(Model model) {
        return "2b2t/checkout";
    }

    @GetMapping("/2b2t/chat")
    public String get2b2tChat(Model model) {
        return "2b2t/chat";
    }

    @GetMapping("/2b2t/dd")
    public String get2b2tBackground(Model model) {
        return "2b2t/dd"; // Вернет dd.html из папки 2b2t
    }

    @GetMapping("/info/faq")
    public String faq(Model model) {
        return "info/faq";
    }
    @GetMapping("/info/about")
    public String about(Model model) {
        return "info/about";
    }
    @GetMapping("/info/agreement")
    public String agreement(Model model) {
        return "info/agreement";
    }
    @GetMapping("/info/contact")
    public String contact(Model model) {
        return "info/contact"; // Вернет dd.html из папки 2b2t
    }
    @GetMapping("/info/oferta")
    public String oferta(Model model) {
        return "info/oferta"; // Вернет dd.html из папки 2b2t
    }
    @GetMapping("/info/privacy")
    public String privacy(Model model) {
        return "info/privacy"; // Вернет dd.html из папки 2b2t
    }
    @GetMapping("/info/refund")
    public String refund(Model model) {
        return "info/refund"; // Вернет dd.html из папки 2b2t
    }
    @GetMapping("/info/terms")
    public String terms(Model model) {
        return "info/terms"; // Вернет dd.html из папки 2b2t
    }

    // Динамический чат с orderId
    @GetMapping("/9b9t/chat/{orderId}")
    public String get9b9tOrderChat(@PathVariable String orderId, Model model) {
        model.addAttribute("orderId", orderId);
        return "9b9t/chat";
    }


    @GetMapping("/2b2t/chat/{orderId}")
    public String get2b2tOrderChat(@PathVariable String orderId, Model model) {
        model.addAttribute("orderId", orderId);
        return "2b2t/chat";

    }
}