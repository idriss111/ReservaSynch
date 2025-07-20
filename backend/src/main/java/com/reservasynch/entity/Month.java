package com.reservasynch.entity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Month {

    @JsonProperty("has_arrivals")
    private Boolean hasArrivals;  // true

    @JsonProperty("month")
    private String month;  // "202508"

    @JsonProperty("total_days")
    private Integer totalDays;  // 31

    @JsonProperty("days")
    private List<Day> days;

    // Constructors
    public Month() {}

    public Month(Boolean hasArrivals, String month, Integer totalDays, List<Day> days) {
        this.hasArrivals = hasArrivals;
        this.month = month;
        this.totalDays = totalDays;
        this.days = days;
    }

    // Getters and Setters
    public Boolean getHasArrivals() { return hasArrivals; }
    public void setHasArrivals(Boolean hasArrivals) { this.hasArrivals = hasArrivals; }

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }

    public Integer getTotalDays() { return totalDays; }
    public void setTotalDays(Integer totalDays) { this.totalDays = totalDays; }

    public List<Day> getDays() { return days; }
    public void setDays(List<Day> days) { this.days = days; }

    @Override
    public String toString() {
        return "Month{" +
                "month='" + month + '\'' +
                ", hasArrivals=" + hasArrivals +
                ", totalDays=" + totalDays +
                ", days=" + (days != null ? days.size() : 0) + " days" +
                '}';
    }
}
