package com.farukgenc.boilerplate.springboot.controller;

import com.farukgenc.boilerplate.springboot.service.AvailabilityService;
import com.farukgenc.boilerplate.springboot.service.BusinessServiceService;
import com.farukgenc.boilerplate.springboot.model.BusinessService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;
    private final BusinessServiceService businessServiceService;

    @GetMapping("/slots")
    public ResponseEntity<List<String>> getAvailableSlots(
            @RequestParam UUID professionalId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) UUID serviceId,
            @RequestParam(defaultValue = "30") int duration) { // Fallback if serviceId not provided

        int finalDuration = duration;

        if (serviceId != null) {
            BusinessService service = businessServiceService.findById(serviceId); // Assuming this method exists or
                                                                                  // similar
            if (service != null) {
                finalDuration = service.getDurationMinutes();
            }
        }

        List<String> slots = availabilityService.getAvailableSlots(professionalId, date, finalDuration);
        return ResponseEntity.ok(slots);
    }
}
