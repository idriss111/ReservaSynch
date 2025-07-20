package com.reservasynch.entity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ImageGallery {

    @JsonProperty("images")
    private List<String> images;

    // Constructors
    public ImageGallery() {}

    public ImageGallery(List<String> images) {
        this.images = images;
    }

    // Getters and Setters
    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    /**
     * Get the main/featured image (first in the list)
     */
    public String getMainImage() {
        return (images != null && !images.isEmpty()) ? images.get(0) : null;
    }

    /**
     * Get thumbnail images (all except the first one)
     */
    public List<String> getThumbnails() {
        if (images != null && images.size() > 1) {
            return images.subList(1, images.size());
        }
        return List.of();
    }

    /**
     * Get image count
     */
    public int getImageCount() {
        return (images != null) ? images.size() : 0;
    }

    /**
     * Check if hotel has images
     */
    public boolean hasImages() {
        return images != null && !images.isEmpty();
    }

    /**
     * Get image at specific index
     */
    public String getImageAt(int index) {
        if (images != null && index >= 0 && index < images.size()) {
            return images.get(index);
        }
        return null;
    }

    @Override
    public String toString() {
        return "ImageGallery{" +
                "imageCount=" + getImageCount() +
                ", mainImage='" + getMainImage() + '\'' +
                '}';
    }
}
