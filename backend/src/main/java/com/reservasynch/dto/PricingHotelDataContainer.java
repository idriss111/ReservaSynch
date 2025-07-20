package com.reservasynch.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PricingHotelDataContainer {

    @JsonProperty("data")
    private PricingHotelData data;

    public PricingHotelDataContainer() {}

    public PricingHotelData getData() { return data; }
    public void setData(PricingHotelData data) { this.data = data; }
}
