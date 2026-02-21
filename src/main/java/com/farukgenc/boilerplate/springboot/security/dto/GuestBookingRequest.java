package com.farukgenc.boilerplate.springboot.security.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class GuestBookingRequest {
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    private UUID professionalId;
    private UUID serviceId;
    private LocalDateTime appointmentTime;
}
