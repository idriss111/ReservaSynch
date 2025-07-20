package com.reservasynch.dto;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.reservasynch.entity.Hotel;

/**
 * SIMPLIFIED Belvilla API Response - HOTEL ONLY
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class SimpleBelvillaResponse {

    @JsonProperty("data")
    private SimpleDataContainer data;

    // Constructor
    public SimpleBelvillaResponse() {}

    // Getters and Setters
    public SimpleDataContainer getData() { return data; }
    public void setData(SimpleDataContainer data) { this.data = data; }
}

