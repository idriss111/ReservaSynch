package com.reservasynch.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class StickyWidget {

    @JsonProperty("data")
    private StickyWidgetData data;

    public StickyWidget() {}

    public StickyWidgetData getData() { return data; }
    public void setData(StickyWidgetData data) { this.data = data; }
}
