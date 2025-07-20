package com.reservasynch.service;

import com.reservasynch.entity.Hotel;
import com.reservasynch.entity.PayablePriceInfo;
import com.reservasynch.entity.CalendarView;
import com.reservasynch.entity.ImageGallery;
import com.reservasynch.entity.Month;
import com.reservasynch.entity.Day;
import com.reservasynch.entity.Stay;
import com.reservasynch.dto.SimpleBelvillaResponse;
import com.reservasynch.dto.PricingNavigationDto;
import com.reservasynch.dto.AvailabilityNavigationDto;
import com.reservasynch.dto.ImageNavigationDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.DeserializationFeature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
public class BelvillaApiService {

    private static final Logger logger = LoggerFactory.getLogger(BelvillaApiService.class);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    @Value("${belvilla.api.base}")
    private String BASE_URL;
    @Value("${belvilla.api.availability}")
    private String AVAILABILITY_URL;
    @Autowired
    private RestTemplate restTemplate;

    private final ObjectMapper objectMapper;

    public BelvillaApiService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    /**
     * Create headers to mimic browser/Postman request
     */
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
        headers.set("Accept", "application/json, text/plain, */*");
        headers.set("Accept-Language", "en-US,en;q=0.9,de;q=0.8");
        headers.set("Cache-Control", "no-cache");
        headers.set("Pragma", "no-cache");
        return headers;
    }

    // ============ HOTEL METHODS ============

    /**
     * Get Hotel data from Belvilla API
     */
    public Hotel getHotel(Long hotelId, LocalDate checkin, LocalDate checkout) {
        // Set defaults if null
        if (checkin == null) {
            checkin = LocalDate.now().plusDays(7);
        }
        if (checkout == null) {
            checkout = checkin.plusDays(7);
        }

        String url = buildApiUrl(hotelId, checkin, checkout, 2, "1-2");
        HttpHeaders headers = createHeaders();
        HttpEntity<?> entity = new HttpEntity<>(headers);

        // Make API call with headers
        ResponseEntity<SimpleBelvillaResponse> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, SimpleBelvillaResponse.class);

        SimpleBelvillaResponse responseBody = response.getBody();
        if (responseBody != null && responseBody.getData() != null &&
                responseBody.getData().getHotelData() != null &&
                responseBody.getData().getHotelData().getData() != null) {
            return responseBody.getData().getHotelData().getData().getHotel();
        }

        return null;
    }

    /**
     * Get Hotel with default dates
     */
    public Hotel getHotel(Long hotelId) {
        return getHotel(hotelId, null, null);
    }

    // ============ PRICING METHODS ============

    /**
     * Get PayablePriceInfo from Belvilla API with proper headers
     */
    public PayablePriceInfo getPricing(Long hotelId, LocalDate checkin, LocalDate checkout, Integer guestCount) {
        // Set defaults if null
        if (checkin == null) {
            checkin = LocalDate.now().plusDays(7);
        }
        if (checkout == null) {
            checkout = checkin.plusDays(7);
        }
        if (guestCount == null) {
            guestCount = 2;
        }

        String roomsConfig = generateRoomsConfig(guestCount);
        String url = buildApiUrl(hotelId, checkin, checkout, guestCount, roomsConfig);

        HttpHeaders headers = createHeaders();
        HttpEntity<?> entity = new HttpEntity<>(headers);

        try {
            // Make API call with headers that mimic Postman
            ResponseEntity<PricingNavigationDto> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, PricingNavigationDto.class);

            PricingNavigationDto responseBody = response.getBody();
            if (responseBody != null) {
                return responseBody.getPayablePriceInfo();
            }
        } catch (Exception e) {
            logger.error("Error getting pricing for hotel {}: {}", hotelId, e.getMessage());
            e.printStackTrace();
        }

        return null;
    }

    /**
     * Get PayablePriceInfo with default values
     */
    public PayablePriceInfo getPricing(Long hotelId) {
        return getPricing(hotelId, null, null, null);
    }

    /**
     * Get PayablePriceInfo with custom dates
     */
    public PayablePriceInfo getPricing(Long hotelId, LocalDate checkin, LocalDate checkout) {
        return getPricing(hotelId, checkin, checkout, 2);
    }

    /**
     * Get pricing summary string for quick display
     */
    public String getPricingSummary(Long hotelId) {
        PayablePriceInfo pricing = getPricing(hotelId);
        if (pricing != null) {
            return String.format("Total: %s (was %s) - Advance: %s",
                    pricing.getPrice(),
                    pricing.getSlasherPrice(),
                    pricing.getTotalPriceBreakup() != null && !pricing.getTotalPriceBreakup().isEmpty()
                            ? pricing.getTotalPriceBreakup().get(0).getPrice() : "N/A");
        }
        return "Pricing not available";
    }

    // ============ ENHANCED AVAILABILITY METHODS ============

    /**
     * Get CalendarView with all availability data for a hotel
     * Default behavior: from 1st of current month to end of 3rd month ahead
     * Example: August 2025 -> from 2025-08-01 to 2025-10-31
     *
     * @param hotelId The hotel ID
     * @param startDate Starting date for availability search (optional)
     * @param monthsAhead Number of months to search ahead (optional, default 3)
     * @return CalendarView with months, days, and stays data
     */
    public CalendarView getAvailability(Long hotelId, LocalDate startDate, Integer monthsAhead) {
        // Set defaults if null
        if (startDate == null) {
            // Default: 1st of current month
            LocalDate now = LocalDate.now();
            startDate = LocalDate.of(now.getYear(), now.getMonth(), 1);
        }
        if (monthsAhead == null) {
            monthsAhead = 3; // Default: 3 months ahead
        }

        String url = buildAvailabilityUrl(hotelId, startDate, monthsAhead);
        HttpHeaders headers = createHeaders();
        HttpEntity<?> entity = new HttpEntity<>(headers);

        try {
            // Make API call to get availability
            ResponseEntity<AvailabilityNavigationDto> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, AvailabilityNavigationDto.class);

            AvailabilityNavigationDto responseBody = response.getBody();
            if (responseBody != null) {
                CalendarView calendarView = responseBody.getCalendarView();
                if (calendarView != null) {
                    logger.info("Successfully retrieved availability for hotel {} with {} months of data",
                            hotelId, calendarView.getMonths() != null ? calendarView.getMonths().size() : 0);
                }
                return calendarView;
            }
        } catch (Exception e) {
            logger.error("Error getting availability for hotel {}: {}", hotelId, e.getMessage());
            e.printStackTrace();
        }

        return null;
    }

    /**
     * Get availability with default values
     * From 1st of current month to end of 3rd month ahead
     * Example: If today is 2025-08-14 -> from 2025-08-01 to 2025-10-31
     */
    public CalendarView getAvailability(Long hotelId) {
        return getAvailability(hotelId, null, null);
    }

    /**
     * Get availability from specific start date with default 3 months ahead
     * @param hotelId The hotel ID
     * @param startDate Starting date (will use 1st of that month)
     */
    public CalendarView getAvailability(Long hotelId, LocalDate startDate) {
        // Ensure we start from the 1st of the month
        if (startDate != null) {
            startDate = LocalDate.of(startDate.getYear(), startDate.getMonth(), 1);
        }
        return getAvailability(hotelId, startDate, 3);
    }

    /**
     * Get availability for a specific month range
     * @param hotelId The hotel ID
     * @param year The year (e.g., 2025)
     * @param startMonth The starting month (1-12)
     * @param monthsAhead Number of months to include (default 3)
     */
    public CalendarView getAvailabilityByMonth(Long hotelId, Integer year, Integer startMonth, Integer monthsAhead) {
        if (year == null) year = LocalDate.now().getYear();
        if (startMonth == null) startMonth = LocalDate.now().getMonthValue();
        if (monthsAhead == null) monthsAhead = 3;

        LocalDate startDate = LocalDate.of(year, startMonth, 1);
        return getAvailability(hotelId, startDate, monthsAhead);
    }

    /**
     * Check if specific dates are available
     * @param hotelId The hotel ID
     * @param checkin Desired check-in date
     * @param checkout Desired check-out date
     * @return true if dates are available, false otherwise
     */
    public boolean isDateRangeAvailable(Long hotelId, LocalDate checkin, LocalDate checkout) {
        // Get availability for the relevant months
        LocalDate searchStart = LocalDate.of(checkin.getYear(), checkin.getMonth(), 1);
        Integer monthsToSearch = (checkout.getYear() - checkin.getYear()) * 12 +
                (checkout.getMonthValue() - checkin.getMonthValue()) + 1;

        CalendarView availability = getAvailability(hotelId, searchStart, monthsToSearch);

        if (availability == null || availability.getMonths() == null) {
            return false;
        }

        // Check if the checkin/checkout combination exists
        return availability.getMonths().stream()
                .flatMap(month -> month.getDays().stream())
                .anyMatch(day -> {
                    // Check if this day matches our checkin date
                    if (day.getCheckin() != null && day.getCheckin().startsWith(checkin.toString())) {
                        // Check if any of the stays match our checkout date
                        return day.getStays().stream()
                                .anyMatch(stay -> stay.getCheckout() != null &&
                                        stay.getCheckout().startsWith(checkout.toString()));
                    }
                    return false;
                });
    }

    /**
     * Get all available check-in dates for a given period
     * @param hotelId The hotel ID
     * @param startDate Start of period
     * @param monthsAhead Number of months to check
     * @return List of available check-in dates
     */
    public List<LocalDate> getAvailableCheckinDates(Long hotelId, LocalDate startDate, Integer monthsAhead) {
        CalendarView availability = getAvailability(hotelId, startDate, monthsAhead);

        if (availability == null || availability.getMonths() == null) {
            return new ArrayList<>();
        }

        return availability.getMonths().stream()
                .flatMap(month -> month.getDays().stream())
                .map(day -> LocalDate.parse(day.getCheckin().substring(0, 10)))
                .collect(Collectors.toList());
    }

    /**
     * Get available stays for a specific check-in date
     * @param hotelId The hotel ID
     * @param checkinDate The check-in date
     * @return List of possible checkout dates (as Stay objects)
     */
    public List<Stay> getAvailableStaysForCheckin(Long hotelId, LocalDate checkinDate) {
        // Get availability for the month containing the check-in date
        LocalDate searchStart = LocalDate.of(checkinDate.getYear(), checkinDate.getMonth(), 1);
        CalendarView availability = getAvailability(hotelId, searchStart, 3);

        if (availability == null || availability.getMonths() == null) {
            return new ArrayList<>();
        }

        // Find the day matching the check-in date
        return availability.getMonths().stream()
                .flatMap(month -> month.getDays().stream())
                .filter(day -> day.getCheckin() != null &&
                        day.getCheckin().startsWith(checkinDate.toString()))
                .findFirst()
                .map(Day::getStays)
                .orElse(new ArrayList<>());
    }

    /**
     * Get Day object for a specific check-in date
     * @param hotelId The hotel ID
     * @param checkinDate The check-in date
     * @return Day object with all information or null if not found
     */
    public Day getDayInfo(Long hotelId, LocalDate checkinDate) {
        // Get availability for the month containing the check-in date
        LocalDate searchStart = LocalDate.of(checkinDate.getYear(), checkinDate.getMonth(), 1);
        CalendarView availability = getAvailability(hotelId, searchStart, 3);

        if (availability == null || availability.getMonths() == null) {
            return null;
        }

        // Find the day matching the check-in date
        return availability.getMonths().stream()
                .flatMap(month -> month.getDays().stream())
                .filter(day -> day.getCheckin() != null &&
                        day.getCheckin().startsWith(checkinDate.toString()))
                .findFirst()
                .orElse(null);
    }


    public String getAvailabilitySummary(Long hotelId) {
        CalendarView availability = getAvailability(hotelId);
        if (availability != null && availability.getMonths() != null) {
            long totalAvailableDays = availability.getMonths().stream()
                    .mapToLong(month -> month.getDays() != null ? month.getDays().size() : 0)
                    .sum();

            return String.format("Hotel %d: %d months loaded, %d available days, last date: %s",
                    hotelId,
                    availability.getMonths().size(),
                    totalAvailableDays,
                    availability.getLastAvailableDate());
        }
        return "No availability data found";
    }


    public ImageGallery getImages(Long hotelId, LocalDate checkin, LocalDate checkout) {
        // Set defaults if null
        if (checkin == null) {
            checkin = LocalDate.now().plusDays(7);
        }
        if (checkout == null) {
            checkout = checkin.plusDays(7);
        }

        String url = buildApiUrl(hotelId, checkin, checkout, 2, "1-2");
        HttpHeaders headers = createHeaders();
        HttpEntity<?> entity = new HttpEntity<>(headers);

        try {
            // Make API call to get hotel data (which includes images)
            ResponseEntity<ImageNavigationDto> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, ImageNavigationDto.class);

            ImageNavigationDto responseBody = response.getBody();
            if (responseBody != null) {
                return responseBody.getImageGallery();
            }
        } catch (Exception e) {
            logger.error("Error getting images for hotel {}: {}", hotelId, e.getMessage());
            e.printStackTrace();
        }

        return null;
    }

    /**
     * Get images with default dates
     */
    public ImageGallery getImages(Long hotelId) {
        return getImages(hotelId, null, null);
    }

    /**
     * Get just the main hotel image (first image)
     * @param hotelId The hotel ID
     * @return Main image URL or null if no images
     */
    public String getMainImage(Long hotelId) {
        ImageGallery gallery = getImages(hotelId);
        return (gallery != null) ? gallery.getMainImage() : null;
    }

    /**
     * Get all image URLs as a simple list
     * @param hotelId The hotel ID
     * @return List of all image URLs
     */
    public List<String> getAllImageUrls(Long hotelId) {
        ImageGallery gallery = getImages(hotelId);
        return (gallery != null) ? gallery.getImages() : List.of();
    }

    /**
     * Get thumbnail images (all except the main image)
     * @param hotelId The hotel ID
     * @return List of thumbnail image URLs
     */
    public List<String> getThumbnailImages(Long hotelId) {
        ImageGallery gallery = getImages(hotelId);
        return (gallery != null) ? gallery.getThumbnails() : List.of();
    }

    /**
     * Get image count for a hotel
     * @param hotelId The hotel ID
     * @return Number of images available
     */
    public int getImageCount(Long hotelId) {
        ImageGallery gallery = getImages(hotelId);
        return (gallery != null) ? gallery.getImageCount() : 0;
    }

    /**
     * Check if hotel has images
     * @param hotelId The hotel ID
     * @return true if hotel has images, false otherwise
     */
    public boolean hasImages(Long hotelId) {
        return getImageCount(hotelId) > 0;
    }

    // ============ UTILITY METHODS ============


    public boolean hotelExists(Long hotelId) {
        Hotel hotel = getHotel(hotelId);
        return hotel != null && hotel.getHotelName() != null;
    }


    public String getHotelInfo(Long hotelId) {
        Hotel hotel = getHotel(hotelId);
        if (hotel != null) {
            return String.format("%s - %s, %s (%s)",
                    hotel.getHotelName(),
                    hotel.getCityName(),
                    hotel.getCountryName(),
                    hotel.getCategory());
        }
        return "Hotel not found";
    }


    private String buildApiUrl(Long hotelId, LocalDate checkin, LocalDate checkout, Integer guestCount, String roomsConfig) {
        return UriComponentsBuilder.fromHttpUrl(BASE_URL)
                .queryParam("hotelId", hotelId)
                .queryParam("checkin", checkin.format(DATE_FORMAT))
                .queryParam("checkout", checkout.format(DATE_FORMAT))
                .queryParam("total_guest_count", guestCount)
                .queryParam("rooms_config", roomsConfig)
                .queryParam("user_mode[]", "Consumer_Guest")
                .queryParam("source", "Mobile Web Booking")
                .queryParam("isOpenSearch", "true")
                .queryParam("selected_rcid", "1")
                .queryParam("coupon", "")
                .queryParam("country_code", "BE")
                .queryParam("brand", "BV")
                .queryParam("company_code", "")
                .queryParam("entity", "")
                .queryParam("locale", "de")
                .toUriString();
    }


    private String buildAvailabilityUrl(Long hotelId, LocalDate startDate, Integer monthsAhead) {
        // Calculate end date: last day of the final month
        LocalDate endDate = startDate.plusMonths(monthsAhead).minusDays(1);

        return UriComponentsBuilder.fromHttpUrl(AVAILABILITY_URL)
                .queryParam("hotel_id", hotelId)
                .queryParam("start_time", startDate.format(DATE_FORMAT))
                .queryParam("end_time", endDate.format(DATE_FORMAT))
                .queryParam("request_type", "calendar_view")
                .queryParam("page_type", "Hotel Detail Page")
                .queryParam("selected_rcid", "1")
                .toUriString();
    }


    private String generateRoomsConfig(Integer guestCount) {
        if (guestCount <= 2) return "1-2";
        if (guestCount <= 4) return "2-2";
        if (guestCount <= 6) return "3-2";
        return "1-" + guestCount;
    }


    public ObjectMapper getObjectMapper() {
        return objectMapper;
    }
}