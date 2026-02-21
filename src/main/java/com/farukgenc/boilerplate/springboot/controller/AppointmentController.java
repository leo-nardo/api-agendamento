package com.farukgenc.boilerplate.springboot.controller;

import com.farukgenc.boilerplate.springboot.model.Appointment;
import com.farukgenc.boilerplate.springboot.service.AppointmentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.findAll());
    }

    @PostMapping
    public ResponseEntity<Appointment> createAppointment(@RequestBody CreateAppointmentRequest request) {
        java.util.UUID companyId = com.farukgenc.boilerplate.springboot.security.TenantContext.getTenantId();
        Appointment appointment = appointmentService.createAppointment(
                companyId,
                request.getProfessionalId(),
                request.getBusinessServiceId(),
                request.getCustomerId(),
                request.getStartDate(),
                request.getEndDate());
        return ResponseEntity.ok(appointment);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelAppointment(@PathVariable UUID id) {
        appointmentService.cancelAppointment(id);
        return ResponseEntity.ok().build();
    }

    @Data
    public static class CreateAppointmentRequest {
        private UUID professionalId;
        private UUID businessServiceId;
        private UUID customerId; // Optional
        private LocalDateTime startDate;
        private LocalDateTime endDate;
    }
}
