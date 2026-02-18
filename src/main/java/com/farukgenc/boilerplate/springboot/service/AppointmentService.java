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
    public Appointment createAppointment(UUID professionalId, UUID businessServiceId, UUID customerId,
            java.time.LocalDateTime startTime, java.time.LocalDateTime endTime) {

        // 1. Validate Professional
        Professional professional = professionalRepository.findById(professionalId)
                .orElseThrow(() -> new RuntimeException("Professional not found"));

        // 2. Validate Service
        BusinessService service = businessServiceRepository.findById(businessServiceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        // 3. Check Availability
        if (!availabilityService.isAvailable(professionalId, startTime, endTime)) {
            throw new RuntimeException("Professional is not available for the selected time.");
        }

        Appointment.AppointmentBuilder<?, ?> builder = Appointment.builder()
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

    public void cancelAppointment(UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus(AppointmentStatus.CANCELED);
        appointmentRepository.save(appointment);
    }
}
