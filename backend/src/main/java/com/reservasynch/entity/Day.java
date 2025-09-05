package com.reservasynch.entity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
@JsonIgnoreProperties(ignoreUnknown = true)
public class Day {

    @JsonProperty("checkin")
    private String checkin;

    @JsonProperty("week_day_number")
    private Integer weekDayNumber;  // 5 (Friday)
    @JsonProperty("minimum_days_stay")
    private Integer minimumDaysStay;

    @JsonProperty("stays")
    private List<Stay> stays;

    // Constructors
    public Day() {}

    public Day(String checkin, Integer weekDayNumber, Integer minimumDaysStay, List<Stay> stays) {
        this.checkin = checkin;
        this.weekDayNumber = weekDayNumber;
        this.minimumDaysStay = minimumDaysStay;
        this.stays = stays;
    }

    // Getters and Setters
    public String getCheckin() { return checkin; }
    public void setCheckin(String checkin) { this.checkin = checkin; }

    public Integer getWeekDayNumber() { return weekDayNumber; }
    public void setWeekDayNumber(Integer weekDayNumber) { this.weekDayNumber = weekDayNumber; }

    public Integer getMinimumDaysStay() { return minimumDaysStay; }
    public void setMinimumDaysStay(Integer minimumDaysStay) { this.minimumDaysStay = minimumDaysStay; }

    public List<Stay> getStays() { return stays; }
    public void setStays(List<Stay> stays) { this.stays = stays; }

    @Override
    public String toString() {
        return "Day{" +
                "checkin='" + checkin + '\'' +
                ", weekDayNumber=" + weekDayNumber +
                ", minimumDaysStay=" + minimumDaysStay +
                ", stays=" + (stays != null ? stays.size() : 0) + " stays" +
                '}';
    }
}