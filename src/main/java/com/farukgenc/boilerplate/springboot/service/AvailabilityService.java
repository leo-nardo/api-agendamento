package com.farukgenc.boilerplate.springboot.service;

import com.farukgenc.boilerplate.springboot.model.Appointment;
import com.farukgenc.boilerplate.springboot.model.AppointmentStatus;
import com.farukgenc.boilerplate.springboot.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final AppointmentRepository appointmentRepository;

    /**
     * Checks if a professional is available for a given time range.
     * Returns true if there are no conflicting appointments.
     */
    public boolean isAvailable(UUID professionalId, LocalDateTime startDate, LocalDateTime endDate) {
        // Find existing appointments that overlap with the requested range
        // Logic: (StartA <= EndB) and (EndA >= StartB)

        // We fetch appointments for the professional around the date to filter in
        // memory or use complex DB query
        // For simplicity here, we assume exact checks or a slightly wider range query
        // Let's use the repository method to find strictly overlapping ones if
        // possible,
        // but typically JPA 'NotBetween' is hard.

        // A simple approach: find all appointments on the same day and check overlap in
        // Java
        LocalDateTime dayStart = startDate.toLocalDate().atStartOfDay();
        LocalDateTime dayEnd = startDate.toLocalDate().plusDays(1).atStartOfDay();

        List<Appointment> appointments = appointmentRepository.findByProfessionalIdAndStartTimeBetween(professionalId,
                dayStart, dayEnd);

        for (Appointment appointment : appointments) {

            // Ignore cancelled appointments
            if (appointment.getStatus() == AppointmentStatus.CANCELED) {
                continue;
            }

            // Check overlap
            if (isOverlapping(startDate, endDate, appointment.getStartTime(), appointment.getEndTime())) {
                return false;
            }
        }

        return true;
    }

    private boolean isOverlapping(LocalDateTime start1, LocalDateTime end1, LocalDateTime start2, LocalDateTime end2) {
        return start1.isBefore(end2) && start2.isBefore(end1);
    }
}
