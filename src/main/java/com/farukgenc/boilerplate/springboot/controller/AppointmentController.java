package com.farukgenc.boilerplate.springboot.controller;

import com.farukgenc.boilerplate.springboot.model.Appointment;
import com.farukgenc.boilerplate.springboot.payload.response.AppointmentResponse;
import com.farukgenc.boilerplate.springboot.service.AppointmentService;
import com.farukgenc.boilerplate.springboot.utils.DtoMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('MANAGE_ALL_APPOINTMENTS', 'VIEW_ALL_APPOINTMENTS', 'VIEW_OWN_APPOINTMENTS', 'CREATE_APPOINTMENT')")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final DtoMapper dtoMapper;

    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments() {
        java.util.UUID companyId = com.farukgenc.boilerplate.springboot.security.TenantContext.getTenantId();
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication()
                .getName();
        List<AppointmentResponse> responses = appointmentService.findAllForUser(companyId, email)
                .stream()
                .map(dtoMapper::toAppointmentResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    public ResponseEntity<AppointmentResponse> createAppointment(@RequestBody CreateAppointmentRequest request) {
        java.util.UUID companyId = com.farukgenc.boilerplate.springboot.security.TenantContext.getTenantId();
        Appointment appointment = appointmentService.createAppointment(
                companyId,
                request.getProfessionalId(),
                request.getBusinessServiceId(),
                request.getCustomerId(),
                request.getStartDate(),
                request.getEndDate());
        return ResponseEntity.ok(dtoMapper.toAppointmentResponse(appointment));
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
