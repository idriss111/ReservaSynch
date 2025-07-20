package com.reservasynch.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.reservasynch.entity.Hotel; /**
 * Simplified hotel data - ONLY the Hotel entity, ignores all widgets, pricing, etc.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class SimpleHotelData {

    @JsonProperty("hotel")
    private Hotel hotel;  // ONLY this - ignore everything else!

    // Constructor
    public SimpleHotelData() {}

    // Getters and Setters
    public Hotel getHotel() { return hotel; }
    public void setHotel(Hotel hotel) { this.hotel = hotel; }
}
