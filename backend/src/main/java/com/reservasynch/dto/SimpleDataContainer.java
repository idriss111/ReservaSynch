package com.reservasynch.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty; /**
 * Simplified data container - ignores everything except hotelData
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class SimpleDataContainer {

    @JsonProperty("hotelData")
    private SimpleHotelDataContainer hotelData;

    // Constructor
    public SimpleDataContainer() {}

    // Getters and Setters
    public SimpleHotelDataContainer getHotelData() { return hotelData; }
    public void setHotelData(SimpleHotelDataContainer hotelData) { this.hotelData = hotelData; }
}
