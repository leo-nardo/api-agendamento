package com.farukgenc.boilerplate.springboot.repository;

import com.farukgenc.boilerplate.springboot.model.Appointment;
import com.farukgenc.boilerplate.springboot.model.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

        List<Appointment> findByProfessionalIdAndStartTimeBetween(UUID professionalId, LocalDateTime start,
                        LocalDateTime end);

        List<Appointment> findByProfessionalIdAndStatusAndStartTimeBetween(UUID professionalId,
                        AppointmentStatus status,
                        LocalDateTime start, LocalDateTime end);

        List<Appointment> findByCustomerId(UUID customerId);

        List<Appointment> findByCompanyId(UUID companyId);

        List<Appointment> findByCompanyIdAndProfessionalId(UUID companyId, UUID professionalId);

        @Modifying
        @Query("DELETE FROM Appointment a WHERE a.companyId = :companyId")
        void deleteByCompanyId(@Param("companyId") UUID companyId);
}
