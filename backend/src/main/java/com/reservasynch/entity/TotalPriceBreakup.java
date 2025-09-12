package com.reservasynch.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty; /**
 * Price breakup item class for payment breakdown
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class TotalPriceBreakup {

    @JsonProperty("title")
    private String title;  // "Im Voraus zu zahlen" or "Zu zahlen vor Ort in der Unterkunft"

    @JsonProperty("price")
    private String price;  // "€2184" or "€202"

    // Constructors
    public TotalPriceBreakup() {}

    public TotalPriceBreakup(String title, String price) {
        this.title = title;
        this.price = price;
    }


    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getPrice() { return price; }
    public void setPrice(String price) { this.price = price; }

    @Override
    public String toString() {
        return "TotalPriceBreakup{" +
                "title='" + title + '\'' +
                ", price='" + price + '\'' +
                '}';
    }
}
