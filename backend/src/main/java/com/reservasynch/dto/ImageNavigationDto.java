package com.reservasynch.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.reservasynch.entity.ImageGallery;
import com.reservasynch.entity.HeaderWidget;
import java.util.List;
import java.util.Map;

/**
 * DTO to navigate to image data in the hotel API response
 * Path: data.hotelData.data.header_widgets[0].data.images[]
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ImageNavigationDto {

    @JsonProperty("data")
    private Map<String, Object> data;

    public ImageNavigationDto() {}

    public Map<String, Object> getData() { return data; }
    public void setData(Map<String, Object> data) { this.data = data; }

    /**
     * Navigate directly to images and return as ImageGallery
     * Returns null if path doesn't exist
     */
    @SuppressWarnings("unchecked")
    public ImageGallery getImageGallery() {
        try {
            if (data == null) {
                System.out.println("ERROR: data is null");
                return null;
            }

            // data.hotelData
            Map<String, Object> hotelData = (Map<String, Object>) data.get("hotelData");
            if (hotelData == null) {
                System.out.println("ERROR: hotelData is null");
                return null;
            }

            // hotelData.data
            Map<String, Object> hotelDataContent = (Map<String, Object>) hotelData.get("data");
            if (hotelDataContent == null) {
                System.out.println("ERROR: hotelData.data is null");
                return null;
            }

            // data.header_widgets
            List<Map<String, Object>> headerWidgets = (List<Map<String, Object>>) hotelDataContent.get("header_widgets");
            if (headerWidgets == null || headerWidgets.isEmpty()) {
                System.out.println("ERROR: header_widgets is null or empty");
                return null;
            }

            // Find the widget that contains images (usually first one with type "hotel_images_web")
            Map<String, Object> imageWidget = null;
            for (Map<String, Object> widget : headerWidgets) {
                String type = (String) widget.get("type");
                if ("hotel_images_web".equals(type)) {
                    imageWidget = widget;
                    break;
                }
            }

            if (imageWidget == null) {
                // Fallback: use first widget if no specific image widget found
                imageWidget = headerWidgets.get(0);
            }

            // header_widgets[0].data
            Map<String, Object> widgetData = (Map<String, Object>) imageWidget.get("data");
            if (widgetData == null) {
                System.out.println("ERROR: widget data is null");
                return null;
            }

            // data.images
            List<String> images = (List<String>) widgetData.get("images");
            if (images == null) {
                System.out.println("ERROR: images is null");
                return null;
            }

            System.out.println("SUCCESS: Found " + images.size() + " images");

            // Create and return ImageGallery
            return new ImageGallery(images);

        } catch (Exception e) {
            System.err.println("ERROR during image navigation: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Get just the main image URL (first image)
     */
    public String getMainImage() {
        ImageGallery gallery = getImageGallery();
        return (gallery != null) ? gallery.getMainImage() : null;
    }

    /**
     * Get all image URLs as a simple List<String>
     */
    public List<String> getAllImages() {
        ImageGallery gallery = getImageGallery();
        return (gallery != null) ? gallery.getImages() : List.of();
    }

    /**
     * Get image count
     */
    public int getImageCount() {
        ImageGallery gallery = getImageGallery();
        return (gallery != null) ? gallery.getImageCount() : 0;
    }

    /**
     * Check if hotel has images
     */
    public boolean hasImages() {
        return getImageCount() > 0;
    }

    @Override
    public String toString() {
        return "ImageNavigationDto{" +
                "imageCount=" + getImageCount() +
                ", mainImage='" + getMainImage() + '\'' +
                '}';
    }
}