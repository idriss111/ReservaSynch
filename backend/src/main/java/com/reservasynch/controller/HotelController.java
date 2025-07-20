package com.reservasynch.controller;

import com.reservasynch.entity.Hotel;
import com.reservasynch.entity.PayablePriceInfo;
import com.reservasynch.entity.CalendarView;
import com.reservasynch.entity.Month;
import com.reservasynch.entity.Day;
import com.reservasynch.entity.Stay;
import com.reservasynch.entity.ImageGallery;
import com.reservasynch.service.BelvillaApiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hotels")
@CrossOrigin(origins = "*")
public class HotelController {

    private static final Logger logger = LoggerFactory.getLogger(HotelController.class);

    @Autowired
    private BelvillaApiService belvillaApiService;


    @GetMapping("/{hotelId}")
    public ResponseEntity<Hotel> getHotel(@PathVariable Long hotelId) {
        try {
            Hotel hotel = belvillaApiService.getHotel(hotelId);

            if (hotel != null) {
                return ResponseEntity.ok(hotel);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error getting hotel {}: {}", hotelId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }


    @GetMapping("/{hotelId}/images/urls")
    public ResponseEntity<List<String>> getAllImageUrls(@PathVariable Long hotelId) {
        try {
            List<String> imageUrls = belvillaApiService.getAllImageUrls(hotelId);
            return ResponseEntity.ok(imageUrls);
        } catch (Exception e) {
            logger.error("Error getting image URLs for hotel {}: {}", hotelId, e.getMessage());
            return ResponseEntity.ok(List.of());
        }
    }


    @GetMapping("/{hotelId}/pricing/dates")
    public ResponseEntity<PayablePriceInfo> getPricingWithDates(
            @PathVariable Long hotelId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkin,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkout) {

        try {
            PayablePriceInfo pricing = belvillaApiService.getPricing(hotelId, checkin, checkout);

            if (pricing != null) {
                return ResponseEntity.ok(pricing);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error getting pricing with dates for hotel {}: {}", hotelId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }


    @GetMapping("/{hotelId}/availability/checkin-dates")
    public ResponseEntity<List<String>> getAvailableCheckinDates(
            @PathVariable Long hotelId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(defaultValue = "3") Integer months) {

        try {
            logger.info("Getting available checkin dates for hotel {} starting from {} for {} months",
                    hotelId, start, months);

            List<LocalDate> checkinDates = belvillaApiService.getAvailableCheckinDates(hotelId, start, months);

            // Convert to string format for easy frontend consumption
            List<String> checkinDateStrings = checkinDates.stream()
                    .map(LocalDate::toString)
                    .collect(Collectors.toList());

            logger.info("Found {} available checkin dates for hotel {}", checkinDateStrings.size(), hotelId);
            return ResponseEntity.ok(checkinDateStrings);

        } catch (Exception e) {
            logger.error("Error getting available checkin dates for hotel {}: {}", hotelId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }


    @GetMapping("/{hotelId}/availability/checkout-dates")
    public ResponseEntity<List<String>> getAvailableCheckoutDates(
            @PathVariable Long hotelId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkin) {

        try {
            logger.info("Getting available checkout dates for hotel {} with checkin {}", hotelId, checkin);

            List<Stay> stays = belvillaApiService.getAvailableStaysForCheckin(hotelId, checkin);

            // Extract checkout dates and convert to strings
            List<String> checkoutDates = stays.stream()
                    .map(stay -> stay.getCheckout().substring(0, 10)) // Extract date part "2025-08-04"
                    .collect(Collectors.toList());

            logger.info("Found {} available checkout dates for hotel {} with checkin {}",
                    checkoutDates.size(), hotelId, checkin);
            return ResponseEntity.ok(checkoutDates);

        } catch (Exception e) {
            logger.error("Error getting available checkout dates for hotel {}: {}", hotelId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}