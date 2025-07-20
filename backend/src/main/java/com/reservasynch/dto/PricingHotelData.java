package com.reservasynch.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PricingHotelData {

    @JsonProperty("sticky_widgets_list")
    private List<StickyWidget> stickyWidgets;

    public PricingHotelData() {}

    public List<StickyWidget> getStickyWidgets() { return stickyWidgets; }
    public void setStickyWidgets(List<StickyWidget> stickyWidgets) { this.stickyWidgets = stickyWidgets; }
}
