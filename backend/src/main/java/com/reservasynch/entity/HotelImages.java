package com.reservasynch.entity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class HotelImages {

    @JsonProperty("header_widgets")
    private List<HeaderWidget> headerWidgets;

    // Constructors
    public HotelImages() {}

    public HotelImages(List<HeaderWidget> headerWidgets) {
        this.headerWidgets = headerWidgets;
    }

    // Getters and Setters
    public List<HeaderWidget> getHeaderWidgets() { return headerWidgets; }
    public void setHeaderWidgets(List<HeaderWidget> headerWidgets) { this.headerWidgets = headerWidgets; }

    /**
     * Extract all images from header widgets
     * @return List of all image URLs found in header widgets
     */
    public List<String> getAllImages() {
        if (headerWidgets == null) return List.of();

        return headerWidgets.stream()
                .filter(widget -> widget.getData() != null && widget.getData().getImages() != null)
                .flatMap(widget -> widget.getData().getImages().stream())
                .toList();
    }

    /**
     * Get the main hotel image (first image from first widget)
     */
    public String getMainImage() {
        List<String> allImages = getAllImages();
        return !allImages.isEmpty() ? allImages.get(0) : null;
    }

    /**
     * Get image gallery for the hotel
     */
    public ImageGallery getImageGallery() {
        return new ImageGallery(getAllImages());
    }

    @Override
    public String toString() {
        return "HotelImages{" +
                "totalImages=" + getAllImages().size() +
                ", mainImage='" + getMainImage() + '\'' +
                '}';
    }
}
