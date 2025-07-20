package com.reservasynch.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;


@JsonIgnoreProperties(ignoreUnknown = true)
public class CalendarView {

    @JsonProperty("months")
    private List<Month> months;

    @JsonProperty("last_available_date")
    private String lastAvailableDate;  // "2027-01-08"

    // Constructors
    public CalendarView() {}

    // Getters and Setters
    public List<Month> getMonths() { return months; }
    public void setMonths(List<Month> months) { this.months = months; }

    public String getLastAvailableDate() { return lastAvailableDate; }
    public void setLastAvailableDate(String lastAvailableDate) { this.lastAvailableDate = lastAvailableDate; }

    @Override
    public String toString() {
        return "CalendarView{" +
                "months=" + (months != null ? months.size() : 0) + " months" +
                ", lastAvailableDate='" + lastAvailableDate + '\'' +
                '}';
    }
}
