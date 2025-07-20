package com.reservasynch.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PricingData {

    @JsonProperty("pricing_detail")
    private PricingDetail pricingDetail;

    public PricingData() {}

    public PricingDetail getPricingDetail() { return pricingDetail; }
    public void setPricingDetail(PricingDetail pricingDetail) { this.pricingDetail = pricingDetail; }
}
