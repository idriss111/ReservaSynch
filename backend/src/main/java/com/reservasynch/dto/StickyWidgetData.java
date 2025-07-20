package com.reservasynch.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class StickyWidgetData {

    @JsonProperty("pricing_data")
    private PricingData pricingData;

    public StickyWidgetData() {}

    public PricingData getPricingData() { return pricingData; }
    public void setPricingData(PricingData pricingData) { this.pricingData = pricingData; }
}
