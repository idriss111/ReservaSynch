package com.reservasynch.controller;

import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/roompot")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.OPTIONS})
public class RoompotController {

    // ---- constants
    private static final String ROOMPOT_BASE =
            "https://boeken.roompot.nl/roompot/object?0&dc=DBEI2&rc=aangebrachteigenaa&lan=de&ownerid=279058159&myenv=true";

    // var arrivalDays = new Array("dd-mm-yyyy",...) OR ["dd-mm-yyyy",...]
    private static final Pattern ARR_PATTERN = Pattern.compile(
            "var\\s+arrivalDays\\s*=\\s*(?:new\\s+Array\\(([\\s\\S]*?)\\)|\\[([\\s\\S]*?)\\])",
            Pattern.CASE_INSENSITIVE
    );
    // var departureDays = new Array("dd-mm-yyyy",...) OR [...]
    private static final Pattern DEP_PATTERN = Pattern.compile(
            "var\\s+departureDays\\s*=\\s*(?:new\\s+Array\\(([\\s\\S]*?)\\)|\\[([\\s\\S]*?)\\])",
            Pattern.CASE_INSENSITIVE
    );
    private static final Pattern DATE_TOKEN = Pattern.compile("\\b\\d{2}-\\d{2}-\\d{4}\\b");

    // Wicket bits
    private static final Pattern WICKET_BASEURL =
            Pattern.compile("Wicket\\.Ajax\\.baseUrl\\s*=\\s*\"([^\"]+)\"");
    private static final Pattern PICKER_BEHAVIOR_ANY =
            Pattern.compile("object\\?[^\"'<>]*dateRangeFacet-dateRangePickerPopup-modal-dateRangePicker");
    private static final Pattern OPEN_MODAL_BEHAVIOR =
            Pattern.compile("object\\?[^\"'<>]*dateRangePickerPopup[^\"'<>]*(open|show)[^\"'<>]*");

    private static final DateTimeFormatter ISO = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DDMMYYYY = DateTimeFormatter.ofPattern("dd-MM-yyyy");

    // ---------- ARRIVAL ----------
    @GetMapping(value = "/arrival-days", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<String>> arrivalDays(
            @RequestParam long resourceId,
            @RequestParam long objectId
    ) throws Exception {

        String url = ROOMPOT_BASE + "&resourceid=" + resourceId + "&objectid=" + objectId;

        String html = Jsoup.connect(url)
                .timeout(15000)
                .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                .header("Accept-Language", "de-DE,de;q=0.9,en;q=0.8")
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36")
                .execute().body();

        Matcher m = ARR_PATTERN.matcher(html);
        if (!m.find()) return ResponseEntity.ok(Collections.emptyList());

        String block = m.group(1) != null ? m.group(1) : m.group(2);
        return ResponseEntity.ok(extractIsoDates(block));
    }

    // ---------- DEPARTURE (true Wicket AJAX) ----------
    @GetMapping(value = "/departure-days", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> departureDays(
            @RequestParam long resourceId,
            @RequestParam long objectId,
            @RequestParam String arrival,              // yyyy-MM-dd or dd-MM-yyyy
            @RequestParam(required = false) boolean debug
    ) throws Exception {

        final String pageUrl = ROOMPOT_BASE + "&resourceid=" + resourceId + "&objectid=" + objectId;
        final String arrivalDdMm = normalizeToDdMmYyyy(arrival);

        // one session for all requests (keeps cookies)
        Connection session = Jsoup.newSession()
                .timeout(15000)
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36")
                .header("Accept-Language", "de-DE,de;q=0.9,en;q=0.8");

        String baseHtml = session.url(pageUrl).execute().body();
        String normalized = baseHtml.replace("&amp;", "&");

        // find Wicket.Ajax.baseUrl -> send as Wicket-Ajax-BaseURL
        String wicketBaseRel = null;
        Matcher bm = WICKET_BASEURL.matcher(normalized);
        if (bm.find()) {
            wicketBaseRel = URLDecoder.decode(bm.group(1), StandardCharsets.UTF_8);
        }

        // find picker behavior; if absent, try to "open" modal once, then search again
        String behaviorPath = findOrWarmPickerBehavior(session, pageUrl, wicketBaseRel, normalized);
        if (behaviorPath == null) {
            if (debug) return ResponseEntity.ok().contentType(MediaType.TEXT_PLAIN)
                    .body("[debug] Could not find picker behavior in page or modal.");
            return ResponseEntity.ok(Collections.emptyList());
        }

        String params = "&date=" + URLEncoder.encode(arrivalDdMm, StandardCharsets.UTF_8)
                + "&startDate=" + URLEncoder.encode(arrivalDdMm, StandardCharsets.UTF_8)
                + "&endDate=null";

        String pickerUrl = "https://boeken.roompot.nl/roompot/" + behaviorPath + params;

        Connection req = session.newRequest().url(pickerUrl)
                .header("Accept", "application/xml, text/xml, */*; q=0.01")
                .header("X-Requested-With", "XMLHttpRequest")
                .header("Wicket-Ajax", "true")
                .referrer(pageUrl)
                .ignoreContentType(true);
        if (wicketBaseRel != null) {
            req.header("Wicket-Ajax-BaseURL", wicketBaseRel);
        }

        String ajaxXml;
        try {
            ajaxXml = req.execute().body();
        } catch (Exception e) {
            if (debug) return ResponseEntity.ok().contentType(MediaType.TEXT_PLAIN)
                    .body("[debug] Behavior request failed: " + e.getClass().getSimpleName() + ": " + e.getMessage());
            return ResponseEntity.ok(Collections.emptyList());
        }

        Matcher dep = DEP_PATTERN.matcher(ajaxXml);
        if (!dep.find()) {
            if (debug) {
                String head = ajaxXml.length() > 1500 ? ajaxXml.substring(0, 1500) + "… [truncated]" : ajaxXml;
                return ResponseEntity.ok().contentType(MediaType.TEXT_PLAIN)
                        .body("[debug] No departureDays matched.\n\n" + head);
            }
            return ResponseEntity.ok(Collections.emptyList());
        }
        String block = dep.group(1) != null ? dep.group(1) : dep.group(2);
        return ResponseEntity.ok(extractIsoDates(block));
    }

    // ---------- DERIVED DEPARTURES (fallback) ----------
    // Returns next arrivalDays after 'arrival' as checkout options, with 'nights'.
    @GetMapping(value = "/derived-departure-days", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Map<String, Object>>> derivedDepartureDays(
            @RequestParam long resourceId,
            @RequestParam long objectId,
            @RequestParam String arrival,            // yyyy-MM-dd or dd-MM-yyyy
            @RequestParam(defaultValue = "21") int maxNights,
            @RequestParam(required = false) List<Integer> allowedNights // e.g. ?allowedNights=3&allowedNights=4&allowedNights=7
    ) throws Exception {

        List<String> arrivalsIso = arrivalDays(resourceId, objectId).getBody();
        if (arrivalsIso == null || arrivalsIso.isEmpty()) return ResponseEntity.ok(Collections.emptyList());

        LocalDate a = arrival.matches("\\d{2}-\\d{2}-\\d{4}")
                ? LocalDate.parse(arrival, DDMMYYYY)
                : LocalDate.parse(arrival, ISO);

        List<LocalDate> candidates = arrivalsIso.stream()
                .map(LocalDate::parse)
                .filter(d -> d.isAfter(a) && d.isBefore(a.plusDays((long) maxNights + 1)))
                .sorted()
                .collect(Collectors.toList());

        List<Map<String, Object>> out = new ArrayList<>();
        for (LocalDate d : candidates) {
            int nights = (int) Duration.between(a.atStartOfDay(), d.atStartOfDay()).toDays();
            if (allowedNights != null && !allowedNights.isEmpty() && !allowedNights.contains(nights)) continue;
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("departure", d.format(ISO));
            row.put("nights", nights);
            out.add(row);
        }
        return ResponseEntity.ok(out);
    }

    // ---- helpers
    private static List<String> extractIsoDates(String arrayBlock) {
        LinkedHashSet<String> out = new LinkedHashSet<>();
        Matcher t = DATE_TOKEN.matcher(arrayBlock);
        while (t.find()) {
            String[] p = t.group().split("-");
            out.add(p[2] + "-" + p[1] + "-" + p[0]);
        }
        return new ArrayList<>(out);
    }

    private static String normalizeToDdMmYyyy(String s) {
        s = s.trim();
        if (s.matches("\\d{4}-\\d{2}-\\d{2}")) return LocalDate.parse(s, ISO).format(DDMMYYYY);
        if (s.matches("\\d{2}-\\d{2}-\\d{4}")) return s;
        throw new IllegalArgumentException("arrival must be yyyy-MM-dd or dd-MM-yyyy");
    }

    private static String findOrWarmPickerBehavior(Connection session, String pageUrl, String wicketBaseRel, String normalizedHtml) throws Exception {
        Matcher pm = PICKER_BEHAVIOR_ANY.matcher(normalizedHtml);
        if (pm.find()) return pm.group();

        // Try to open modal once, then re-scan its XML
        Matcher om = OPEN_MODAL_BEHAVIOR.matcher(normalizedHtml);
        if (om.find()) {
            String openUrl = "https://boeken.roompot.nl/roompot/" + om.group();
            session.newRequest().url(openUrl)
                    .header("Accept", "application/xml, text/xml, */*; q=0.01")
                    .header("X-Requested-With", "XMLHttpRequest")
                    .header("Wicket-Ajax", "true")
                    .referrer(pageUrl)
                    .ignoreContentType(true)
                    .execute();
            String modalXml = session.response().body().replace("&amp;", "&");
            Matcher pm2 = PICKER_BEHAVIOR_ANY.matcher(modalXml);
            if (pm2.find()) return pm2.group();
        }
        return null;
    }

    // CORS preflights
    @RequestMapping(value = "/arrival-days", method = RequestMethod.OPTIONS) public ResponseEntity<Void> pre1(){return ResponseEntity.ok().build();}
    @RequestMapping(value = "/departure-days", method = RequestMethod.OPTIONS) public ResponseEntity<Void> pre2(){return ResponseEntity.ok().build();}
    @RequestMapping(value = "/derived-departure-days", method = RequestMethod.OPTIONS) public ResponseEntity<Void> pre3(){return ResponseEntity.ok().build();}
}
