package com.reservasynch.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty; /**
 * Simplified hotel data container - ignores everything except data.hotel
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class SimpleHotelDataContainer {

    @JsonProperty("data")
    private SimpleHotelData data;

    // Constructor
    public SimpleHotelDataContainer() {}

    // Getters and Setters
    public SimpleHotelData getData() { return data; }
    public void setData(SimpleHotelData data) { this.data = data; }
}
