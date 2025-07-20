package com.reservasynch.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PricingDataContainer {

    @JsonProperty("hotelData")
    private PricingHotelDataContainer hotelData;

    public PricingDataContainer() {}

    public PricingHotelDataContainer getHotelData() { return hotelData; }
    public void setHotelData(PricingHotelDataContainer hotelData) { this.hotelData = hotelData; }
}
