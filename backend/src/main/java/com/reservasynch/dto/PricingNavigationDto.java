package com.reservasynch.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.reservasynch.entity.PayablePriceInfo;
import java.util.List;
import java.util.Map;

/**
 * CORRECT DTO based on the real JSON structure you provided
 * Path: data.hotelData.data.sticky_widgets_list[0].data.pricing_data.pricing_detail.payable_price_info
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class PricingNavigationDto {

    @JsonProperty("data")
    private Map<String, Object> data;

    public PricingNavigationDto() {}

    public Map<String, Object> getData() { return data; }
    public void setData(Map<String, Object> data) { this.data = data; }

    /**
     * Navigate to PayablePriceInfo using the EXACT path from your JSON
     */
    @SuppressWarnings("unchecked")
    public PayablePriceInfo getPayablePriceInfo() {
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

            // data.sticky_widgets_list
            List<Map<String, Object>> stickyWidgets = (List<Map<String, Object>>) hotelDataContent.get("sticky_widgets_list");
            if (stickyWidgets == null || stickyWidgets.isEmpty()) {
                System.out.println("ERROR: sticky_widgets_list is null or empty");
                return null;
            }

            // sticky_widgets_list[0] (first widget)
            Map<String, Object> firstWidget = stickyWidgets.get(0);
            if (firstWidget == null) {
                System.out.println("ERROR: first widget is null");
                return null;
            }

            // sticky_widgets_list[0].data
            Map<String, Object> widgetData = (Map<String, Object>) firstWidget.get("data");
            if (widgetData == null) {
                System.out.println("ERROR: widget data is null");
                return null;
            }

            // data.pricing_data
            Map<String, Object> pricingData = (Map<String, Object>) widgetData.get("pricing_data");
            if (pricingData == null) {
                System.out.println("ERROR: pricing_data is null");
                return null;
            }

            // pricing_data.pricing_detail
            Map<String, Object> pricingDetail = (Map<String, Object>) pricingData.get("pricing_detail");
            if (pricingDetail == null) {
                System.out.println("ERROR: pricing_detail is null");
                return null;
            }

            // pricing_detail.payable_price_info
            Map<String, Object> payablePriceInfoMap = (Map<String, Object>) pricingDetail.get("payable_price_info");
            if (payablePriceInfoMap == null) {
                System.out.println("ERROR: payable_price_info is null");
                return null;
            }

            System.out.println("SUCCESS: Found payable_price_info with keys: " + payablePriceInfoMap.keySet());

            // Convert Map to PayablePriceInfo using Jackson ObjectMapper
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            PayablePriceInfo result = mapper.convertValue(payablePriceInfoMap, PayablePriceInfo.class);

            System.out.println("SUCCESS: PayablePriceInfo created");
            System.out.println("  - title: " + result.getTitle());
            System.out.println("  - price: " + result.getPrice());
            System.out.println("  - slasher_price: " + result.getSlasherPrice());

            return result;

        } catch (Exception e) {
            System.err.println("ERROR during navigation: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}