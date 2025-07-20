package com.reservasynch.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Hotel {

    // Text fields - String is perfect
    @JsonProperty("hotel_name")
    private String hotelName;

    @JsonProperty("city_name")
    private String cityName;

    @JsonProperty("country_name")
    private String countryName;

    @JsonProperty("currency_code")
    private String currencyCode;  // "EUR" - always 3 letters

    @JsonProperty("currency_symbol")
    private String currencySymbol;

    @JsonProperty("best_image")
    private String bestImage;

    @JsonProperty("category")
    private String category;

    @JsonProperty("address")
    private String address;

    @JsonProperty("hotel_address")
    private String hotelAddress;

    @JsonProperty("formatted_checkin_time")
    private String formattedCheckinTime;

    @JsonProperty("formatted_checkout_time")
    private String formattedCheckoutTime;

    @JsonProperty("property_type")
    private String propertyType;

    // Numeric fields - use proper types for calculations
    @JsonProperty("latitude")
    private BigDecimal latitude;

    @JsonProperty("longitude")
    private BigDecimal longitude;

    // Boolean field - use proper type for logic
    @JsonProperty("tax_exclusive")
    private Boolean taxExclusive;  // true/false - for business logic

    // Constructors
    public Hotel() {}

    // Getters and Setters
    public String getHotelName() { return hotelName; }
    public void setHotelName(String hotelName) { this.hotelName = hotelName; }

    public String getCityName() { return cityName; }
    public void setCityName(String cityName) { this.cityName = cityName; }

    public String getCountryName() { return countryName; }
    public void setCountryName(String countryName) { this.countryName = countryName; }

    public String getCurrencyCode() { return currencyCode; }
    public void setCurrencyCode(String currencyCode) { this.currencyCode = currencyCode; }

    public String getCurrencySymbol() { return currencySymbol; }
    public void setCurrencySymbol(String currencySymbol) { this.currencySymbol = currencySymbol; }

    public String getBestImage() { return bestImage; }
    public void setBestImage(String bestImage) { this.bestImage = bestImage; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getHotelAddress() { return hotelAddress; }
    public void setHotelAddress(String hotelAddress) { this.hotelAddress = hotelAddress; }

    public String getFormattedCheckinTime() { return formattedCheckinTime; }
    public void setFormattedCheckinTime(String formattedCheckinTime) { this.formattedCheckinTime = formattedCheckinTime; }

    public String getFormattedCheckoutTime() { return formattedCheckoutTime; }
    public void setFormattedCheckoutTime(String formattedCheckoutTime) { this.formattedCheckoutTime = formattedCheckoutTime; }

    public String getPropertyType() { return propertyType; }
    public void setPropertyType(String propertyType) { this.propertyType = propertyType; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public Boolean getTaxExclusive() { return taxExclusive; }
    public void setTaxExclusive(Boolean taxExclusive) { this.taxExclusive = taxExclusive; }

    @Override
    public String toString() {
        return "Hotel{" +
                "hotelName='" + hotelName + '\'' +
                ", cityName='" + cityName + '\'' +
                ", countryName='" + countryName + '\'' +
                ", category='" + category + '\'' +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                ", taxExclusive=" + taxExclusive +
                '}';
    }
}