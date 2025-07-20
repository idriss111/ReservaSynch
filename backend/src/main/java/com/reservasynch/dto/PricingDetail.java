package com.reservasynch.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.reservasynch.entity.PayablePriceInfo;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PricingDetail {

    @JsonProperty("payable_price_info")
    private PayablePriceInfo payablePriceInfo;

    public PricingDetail() {}

    public PayablePriceInfo getPayablePriceInfo() { return payablePriceInfo; }
    public void setPayablePriceInfo(PayablePriceInfo payablePriceInfo) { this.payablePriceInfo = payablePriceInfo; }
}
