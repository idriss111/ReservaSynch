package com.reservasynch.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * HeaderWidget - represents widgets in header_widgets array
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class HeaderWidget {

    @JsonProperty("data")
    private HeaderWidgetData data;

    @JsonProperty("id")
    private Long id;

    @JsonProperty("title")
    private String title;

    @JsonProperty("type")
    private String type;  // e.g., "hotel_images_web"

    @JsonProperty("data_source")
    private String dataSource;  // e.g., "inline"

    // Constructors
    public HeaderWidget() {}

    public HeaderWidget(HeaderWidgetData data, Long id, String title, String type, String dataSource) {
        this.data = data;
        this.id = id;
        this.title = title;
        this.type = type;
        this.dataSource = dataSource;
    }

    // Getters and Setters
    public HeaderWidgetData getData() { return data; }
    public void setData(HeaderWidgetData data) { this.data = data; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDataSource() { return dataSource; }
    public void setDataSource(String dataSource) { this.dataSource = dataSource; }

    @Override
    public String toString() {
        return "HeaderWidget{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", type='" + type + '\'' +
                ", data=" + data +
                '}';
    }
}
