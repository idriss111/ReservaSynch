// Create: src/main/java/com/reservasynch/controller/SimpleTestController.java
package com.reservasynch.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SimpleTestController {

    @GetMapping("/test/simple")
    public String simpleTest() {
        return "Spring Boot is working!";
    }
}