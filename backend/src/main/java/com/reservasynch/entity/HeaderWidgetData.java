package com.reservasynch.entity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class HeaderWidgetData {

    @JsonProperty("images")
    private List<String> images;  // List of image URLs

    @JsonProperty("ctas")
    private List<Object> ctas;  // Call-to-action buttons (keeping as Object for flexibility)

    @JsonProperty("is_zoom_animation_enabled")
    private Boolean isZoomAnimationEnabled;

    // Constructors
    public HeaderWidgetData() {}

    public HeaderWidgetData(List<String> images, List<Object> ctas, Boolean isZoomAnimationEnabled) {
        this.images = images;
        this.ctas = ctas;
        this.isZoomAnimationEnabled = isZoomAnimationEnabled;
    }

    // Getters and Setters
    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public List<Object> getCtas() { return ctas; }
    public void setCtas(List<Object> ctas) { this.ctas = ctas; }

    public Boolean getIsZoomAnimationEnabled() { return isZoomAnimationEnabled; }
    public void setIsZoomAnimationEnabled(Boolean isZoomAnimationEnabled) { this.isZoomAnimationEnabled = isZoomAnimationEnabled; }

    /**
     * Helper method to get the main/best image (first image in the list)
     * @return First image URL or null if no images
     */
    public String getMainImage() {
        return (images != null && !images.isEmpty()) ? images.get(0) : null;
    }

    /**
     * Helper method to get image count
     * @return Number of images
     */
    public int getImageCount() {
        return (images != null) ? images.size() : 0;
    }

    @Override
    public String toString() {
        return "HeaderWidgetData{" +
                "images=" + (images != null ? images.size() + " images" : "no images") +
                ", isZoomAnimationEnabled=" + isZoomAnimationEnabled +
                '}';
    }
}
