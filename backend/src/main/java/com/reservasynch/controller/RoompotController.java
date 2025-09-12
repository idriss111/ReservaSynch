package com.reservasynch.controller;

import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/roompot")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.OPTIONS})
public class RoompotController {

    // Base Roompot URL — ids are appended via query params
    private static final String ROOMPOT_BASE =
            "https://boeken.roompot.nl/roompot/object?0&dc=DBEI2&rc=aangebrachteigenaa&lan=de&ownerid=279058159&myenv=true";

    // Matches: var arrivalDays = new Array("dd-mm-yyyy",...)  OR  var arrivalDays = ["dd-mm-yyyy",...]
    private static final Pattern ARR_PATTERN = Pattern.compile(
            "var\\s+arrivalDays\\s*=\\s*(?:new\\s+Array\\(([\\s\\S]*?)\\)|\\[([\\s\\S]*?)\\])",
            Pattern.CASE_INSENSITIVE
    );

    // Individual tokens inside the array
    private static final Pattern DATE_TOKEN = Pattern.compile("\\b\\d{2}-\\d{2}-\\d{4}\\b");

    @GetMapping(value = "/arrival-days", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<String>> arrivalDays(
            @RequestParam long resourceId,
            @RequestParam long objectId
    ) throws Exception {

        String url = ROOMPOT_BASE + "&resourceid=" + resourceId + "&objectid=" + objectId;

        Connection conn = Jsoup
                .connect(url)
                .timeout(12000)
                .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                .header("Accept-Language", "de-DE,de;q=0.9,en;q=0.8")
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36");

        String html = conn.execute().body();

        Matcher m = ARR_PATTERN.matcher(html);
        if (!m.find()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        String arrayBlock = m.group(1) != null ? m.group(1) : m.group(2);

        // Collect unique ISO dates in encounter order
        Set<String> isoOut = new LinkedHashSet<>();
        Matcher dm = DATE_TOKEN.matcher(arrayBlock);
        while (dm.find()) {
            String[] p = dm.group().split("-"); // dd-mm-yyyy
            isoOut.add(p[2] + "-" + p[1] + "-" + p[0]); // -> yyyy-mm-dd
        }

        return ResponseEntity.ok(new ArrayList<>(isoOut));
    }

    // (Optional) explicit preflight handler; @CrossOrigin usually covers this
    @RequestMapping(value = "/arrival-days", method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> preflight() {
        return ResponseEntity.ok().build();
    }
}
