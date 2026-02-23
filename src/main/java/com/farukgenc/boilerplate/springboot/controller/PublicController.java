package com.farukgenc.boilerplate.springboot.controller;

import com.farukgenc.boilerplate.springboot.payload.response.BusinessServiceResponse;
import com.farukgenc.boilerplate.springboot.payload.response.CompanyResponse;
import com.farukgenc.boilerplate.springboot.payload.response.ProfessionalResponse;
import com.farukgenc.boilerplate.springboot.repository.CompanyRepository;
import com.farukgenc.boilerplate.springboot.service.BusinessServiceService;
import com.farukgenc.boilerplate.springboot.service.ProfessionalService;
import com.farukgenc.boilerplate.springboot.service.AppointmentService;
import com.farukgenc.boilerplate.springboot.service.AvailabilityService;
import com.farukgenc.boilerplate.springboot.service.CustomerService;
import com.farukgenc.boilerplate.springboot.utils.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final CompanyRepository companyRepository;
    private final BusinessServiceService businessServiceService;
    private final ProfessionalService professionalService;
    private final AppointmentService appointmentService;
    private final AvailabilityService availabilityService;
    private final CustomerService customerService;
    private final DtoMapper dtoMapper;

    @GetMapping("/company/{slug}")
    public ResponseEntity<CompanyResponse> getCompanyBySlug(@PathVariable String slug) {
        return companyRepository.findBySlug(slug)
                .map(company -> ResponseEntity.ok(dtoMapper.toCompanyResponse(company)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{companyId}/services")
    public ResponseEntity<List<BusinessServiceResponse>> getServices(@PathVariable java.util.UUID companyId) {
        List<BusinessServiceResponse> responses = businessServiceService.findAllByCompanyId(companyId)
                .stream()
                .map(dtoMapper::toBusinessServiceResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{companyId}/professionals")
    public ResponseEntity<List<ProfessionalResponse>> getProfessionals(@PathVariable java.util.UUID companyId) {
        List<ProfessionalResponse> responses = professionalService.findAllByCompanyId(companyId)
                .stream()
                .map(dtoMapper::toProfessionalResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{companyId}/availability/slots")
    public ResponseEntity<List<String>> getAvailableTimeSlots(
            @PathVariable java.util.UUID companyId,
            @RequestParam java.util.UUID professionalId,
            @RequestParam String date, // yyyy-MM-dd
            @RequestParam java.util.UUID serviceId) {
        com.farukgenc.boilerplate.springboot.model.BusinessService service = businessServiceService.findById(serviceId);
        if (!service.getCompanyId().equals(companyId)) {
            throw new RuntimeException("Service mismatch");
        }
        return ResponseEntity
                .ok(availabilityService.getAvailableSlots(professionalId, LocalDate.parse(date),
                        service.getDurationMinutes()));
    }

    @PostMapping("/{companyId}/appointments/guest")
    public ResponseEntity<?> createGuestAppointment(
            @PathVariable java.util.UUID companyId,
            @RequestBody com.farukgenc.boilerplate.springboot.security.dto.GuestBookingRequest request) {
        return ResponseEntity.ok(appointmentService.createGuestAppointment(companyId, request));
    }

    @PostMapping("/{companyId}/customers/register")
    public ResponseEntity<?> registerGuestCustomer(
            @PathVariable java.util.UUID companyId,
            @RequestBody com.farukgenc.boilerplate.springboot.security.dto.GuestRegistrationRequest request) {
        return ResponseEntity.ok(customerService.registerGuest(companyId, request.getEmail(), request.getPassword()));
    }
}
