package com.reservasynch.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.reservasynch.entity.PayablePriceInfo;
import java.util.List;
import java.util.Map;

/**
 * Wrapper that navigates through the JSON structure to find PayablePriceInfo
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class PricingDataWrapper {

    @JsonProperty("hotelData")
    private Map<String, Object> hotelData;

    public PricingDataWrapper() {}

    public Map<String, Object> getHotelData() { return hotelData; }
    public void setHotelData(Map<String, Object> hotelData) { this.hotelData = hotelData; }

    /**
     * Extract PayablePriceInfo from the nested JSON structure
     * CORRECT Path based on your JSON:
     * hotelData.data.sticky_widgets_list[0].data.pricing_data.pricing_detail.payable_price_info
     */
    @SuppressWarnings("unchecked")
    public PayablePriceInfo getPayablePriceInfo() {
        try {
            if (hotelData == null) return null;

            // Navigate: hotelData.data
            Map<String, Object> data = (Map<String, Object>) hotelData.get("data");
            if (data == null) return null;

            // Navigate: data.sticky_widgets_list
            List<Map<String, Object>> stickyWidgets = (List<Map<String, Object>>) data.get("sticky_widgets_list");
            if (stickyWidgets == null || stickyWidgets.isEmpty()) return null;

            // Get first sticky widget: sticky_widgets_list[0]
            Map<String, Object> firstWidget = stickyWidgets.get(0);
            if (firstWidget == null) return null;

            // Navigate: sticky_widgets_list[0].data
            Map<String, Object> widgetData = (Map<String, Object>) firstWidget.get("data");
            if (widgetData == null) return null;

            // Navigate: widgetData.pricing_data
            Map<String, Object> pricingData = (Map<String, Object>) widgetData.get("pricing_data");
            if (pricingData == null) return null;

            // Navigate: pricing_data.pricing_detail
            Map<String, Object> pricingDetail = (Map<String, Object>) pricingData.get("pricing_detail");
            if (pricingDetail == null) return null;

            // Finally get: pricing_detail.payable_price_info
            Object payablePriceInfoObj = pricingDetail.get("payable_price_info");
            if (payablePriceInfoObj == null) return null;

            // This should work - the path matches your JSON exactly
            return (PayablePriceInfo) payablePriceInfoObj;

        } catch (Exception e) {
            e.printStackTrace(); // For debugging
            return null;  // Return null if any navigation fails
        }
    }

    /**
     * Helper method to convert Map to PayablePriceInfo
     * This will be handled automatically by Jackson in the service
     */
    private PayablePriceInfo convertMapToPayablePriceInfo(Map<String, Object> map) {
        // This is a placeholder - Jackson will handle the actual conversion
        // in the service when we use ObjectMapper
        return null;
    }
}