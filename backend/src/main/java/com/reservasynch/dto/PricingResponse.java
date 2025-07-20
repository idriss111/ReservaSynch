package com.reservasynch.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Simple DTO to access pricing data from Belvilla API
 * Maps: data.hotelData.data.sticky_widgets_list[0].data.pricing_data.pricing_detail.payable_price_info
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class PricingResponse {

    @JsonProperty("data")
    private PricingDataWrapper data;

    public PricingResponse() {}

    public PricingDataWrapper getData() { return data; }
    public void setData(PricingDataWrapper data) { this.data = data; }
}