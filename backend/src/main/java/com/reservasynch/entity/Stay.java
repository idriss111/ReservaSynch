package com.reservasynch.entity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Stay {

    @JsonProperty("checkout")
    private String checkout;  // "2025-08-04T00:00:01"


    public Stay() {}

    public Stay(String checkout) {
        this.checkout = checkout;
    }


    public String getCheckout() { return checkout; }
    public void setCheckout(String checkout) { this.checkout = checkout; }

    @Override
    public String toString() {
        return "Stay{" +
                "checkout='" + checkout + '\'' +
                '}';
    }
}
