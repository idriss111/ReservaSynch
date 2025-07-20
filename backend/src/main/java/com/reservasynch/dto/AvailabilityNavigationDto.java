package com.reservasynch.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.reservasynch.entity.CalendarView;
import java.util.Map;

/**
 * DTO to navigate to availability data in the API response
 * We're only interested in the calendar_view part
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class AvailabilityNavigationDto {

    @JsonProperty("calendar_view")
    private CalendarView calendarView;

    // Other top-level fields we might need later
    @JsonProperty("sum_total_availability")
    private Object sumTotalAvailability;

    @JsonProperty("available_room_count")
    private Object availableRoomCount;

    @JsonProperty("restrictions")
    private Object restrictions;

    @JsonProperty("payment_page")
    private Boolean paymentPage;

    // Constructors
    public AvailabilityNavigationDto() {}

    // Getters and Setters
    public CalendarView getCalendarView() { return calendarView; }
    public void setCalendarView(CalendarView calendarView) { this.calendarView = calendarView; }

    public Object getSumTotalAvailability() { return sumTotalAvailability; }
    public void setSumTotalAvailability(Object sumTotalAvailability) { this.sumTotalAvailability = sumTotalAvailability; }

    public Object getAvailableRoomCount() { return availableRoomCount; }
    public void setAvailableRoomCount(Object availableRoomCount) { this.availableRoomCount = availableRoomCount; }

    public Object getRestrictions() { return restrictions; }
    public void setRestrictions(Object restrictions) { this.restrictions = restrictions; }

    public Boolean getPaymentPage() { return paymentPage; }
    public void setPaymentPage(Boolean paymentPage) { this.paymentPage = paymentPage; }

    @Override
    public String toString() {
        return "AvailabilityNavigationDto{" +
                "calendarView=" + calendarView +
                ", paymentPage=" + paymentPage +
                '}';
    }
}