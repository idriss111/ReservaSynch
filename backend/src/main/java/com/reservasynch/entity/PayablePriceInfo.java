package com.reservasynch.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Main pricing information class
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class PayablePriceInfo {

    @JsonProperty("title")
    private String title;  // "Buchungsbetrag"

    @JsonProperty("price_breakup_title")
    private String priceBreakupTitle;  // "Gesamtbetrag"

    @JsonProperty("price")
    private String price;  // "€2386"

    @JsonProperty("price_with_deposit")
    private String priceWithDeposit;  // "€2386"

    @JsonProperty("slasher_price")
    private String slasherPrice;  // "€3787"


    @JsonProperty("total_price_breakup")
    private List<TotalPriceBreakup> totalPriceBreakup;

    // Constructors
    public PayablePriceInfo() {}

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getPriceBreakupTitle() { return priceBreakupTitle; }
    public void setPriceBreakupTitle(String priceBreakupTitle) { this.priceBreakupTitle = priceBreakupTitle; }

    public String getPrice() { return price; }
    public void setPrice(String price) { this.price = price; }

    public String getPriceWithDeposit() { return priceWithDeposit; }
    public void setPriceWithDeposit(String priceWithDeposit) { this.priceWithDeposit = priceWithDeposit; }

    public String getSlasherPrice() { return slasherPrice; }
    public void setSlasherPrice(String slasherPrice) { this.slasherPrice = slasherPrice; }

    public List<TotalPriceBreakup> getTotalPriceBreakup() { return totalPriceBreakup; }
    public void setTotalPriceBreakup(List<TotalPriceBreakup> totalPriceBreakup) { this.totalPriceBreakup = totalPriceBreakup; }

    @Override
    public String toString() {
        return "PayablePriceInfo{" +
                "title='" + title + '\'' +
                ", price='" + price + '\'' +
                ", slasherPrice='" + slasherPrice + '\'' +
                ", totalPriceBreakup=" + totalPriceBreakup +
                '}';
    }
}

