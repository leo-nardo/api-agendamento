package com.farukgenc.boilerplate.springboot.service;

import com.farukgenc.boilerplate.springboot.model.Appointment;
import com.farukgenc.boilerplate.springboot.model.AppointmentStatus;
import com.farukgenc.boilerplate.springboot.model.BusinessService;
import com.farukgenc.boilerplate.springboot.model.Professional;
import com.farukgenc.boilerplate.springboot.repository.AppointmentRepository;
import com.farukgenc.boilerplate.springboot.repository.BusinessServiceRepository;
import com.farukgenc.boilerplate.springboot.repository.CustomerRepository;
import com.farukgenc.boilerplate.springboot.repository.ProfessionalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AvailabilityService availabilityService;
    private final ProfessionalRepository professionalRepository;
    private final BusinessServiceRepository businessServiceRepository;
    private final CustomerRepository customerRepository;

    public List<Appointment> findAll() {
        return appointmentRepository.findAll();
    }

    @Transactional
    public Appointment createAppointment(UUID companyId, UUID professionalId, UUID businessServiceId, UUID customerId,
            java.time.LocalDateTime startTime, java.time.LocalDateTime endTime) {

        // 1. Validate Professional
        Professional professional = professionalRepository.findById(professionalId)
                .orElseThrow(() -> new RuntimeException("Professional not found"));

        if (!professional.getCompanyId().equals(companyId)) {
            throw new RuntimeException("Professional does not belong to this company");
        }

        // 2. Validate Service
        BusinessService service = businessServiceRepository.findById(businessServiceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        if (!service.getCompanyId().equals(companyId)) {
            throw new RuntimeException("Service does not belong to this company");
        }

        // 3. Check Availability
        if (!availabilityService.isAvailable(professionalId, startTime, endTime)) {
            throw new RuntimeException("Professional is not available for the selected time.");
        }

        Appointment.AppointmentBuilder<?, ?> builder = Appointment.builder()
                .companyId(companyId)
                .professional(professional)
                .service(service)
                .startTime(startTime)
                .endTime(endTime)
                .status(AppointmentStatus.SCHEDULED);

        // 4. Handle Optional Customer
        if (customerId != null) {
            var customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
            builder.customer(customer);
        }

        Appointment appointment = builder.build();
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public Appointment createGuestAppointment(
            java.util.UUID companyId,
            com.farukgenc.boilerplate.springboot.security.dto.GuestBookingRequest request) {

        // 1. Validate Professional
        Professional professional = professionalRepository.findById(request.getProfessionalId())
                .orElseThrow(() -> new RuntimeException("Professional not found"));
        if (!professional.getCompanyId().equals(companyId)) {
            throw new RuntimeException("Professional does not belong to this company");
        }

        // 2. Validate Service
        BusinessService service = businessServiceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service not found"));
        if (!service.getCompanyId().equals(companyId)) {
            throw new RuntimeException("Service does not belong to this company");
        }

        // 3. Calculator End Time and Check Availability
        java.time.LocalDateTime startTime = request.getAppointmentTime();
        java.time.LocalDateTime endTime = startTime.plusMinutes(service.getDurationMinutes());

        if (!availabilityService.isAvailable(request.getProfessionalId(), startTime, endTime)) {
            throw new RuntimeException("Professional is not available for the selected time.");
        }

        // 4. Handle Customer (Guest logic)
        com.farukgenc.boilerplate.springboot.model.Customer customer = customerRepository
                .findByEmailAndCompanyId(request.getCustomerEmail(), companyId)
                .orElseGet(() -> {
                    com.farukgenc.boilerplate.springboot.model.Customer newCust = com.farukgenc.boilerplate.springboot.model.Customer
                            .builder()
                            .companyId(companyId)
                            .fullName(request.getCustomerName())
                            .email(request.getCustomerEmail())
                            .phoneNumber(request.getCustomerPhone())
                            .build();
                    return customerRepository.save(newCust);
                });

        Appointment appointment = Appointment.builder()
                .companyId(companyId)
                .professional(professional)
                .service(service)
                .customer(customer)
                .startTime(startTime)
                .endTime(endTime)
                .status(AppointmentStatus.SCHEDULED)
                .build();

        return appointmentRepository.save(appointment);
    }

    public void cancelAppointment(UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus(AppointmentStatus.CANCELED);
        appointmentRepository.save(appointment);
    }
}
