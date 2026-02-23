package com.farukgenc.boilerplate.springboot.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {
    private UUID id;
    private ProfessionalResponse professional;
    private CustomerResponse customer;
    private BusinessServiceResponse service;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private String notes;
}
