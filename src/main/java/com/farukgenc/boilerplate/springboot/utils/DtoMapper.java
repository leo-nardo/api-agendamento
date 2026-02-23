package com.farukgenc.boilerplate.springboot.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.farukgenc.boilerplate.springboot.model.Appointment;
import com.farukgenc.boilerplate.springboot.model.BusinessService;
import com.farukgenc.boilerplate.springboot.model.Company;
import com.farukgenc.boilerplate.springboot.model.Customer;
import com.farukgenc.boilerplate.springboot.model.Professional;
import com.farukgenc.boilerplate.springboot.model.UserAccount;
import com.farukgenc.boilerplate.springboot.payload.response.AppointmentResponse;
import com.farukgenc.boilerplate.springboot.payload.response.BusinessServiceResponse;
import com.farukgenc.boilerplate.springboot.payload.response.CompanyResponse;
import com.farukgenc.boilerplate.springboot.payload.response.CustomerResponse;
import com.farukgenc.boilerplate.springboot.payload.response.ProfessionalResponse;
import org.springframework.stereotype.Component;

@Component
public class DtoMapper {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public CompanyResponse toCompanyResponse(Company company) {
        if (company == null) {
            return null;
        }
        return CompanyResponse.builder()
                .id(company.getId())
                .name(company.getTradeName() != null ? company.getTradeName() : company.getLegalName())
                .slug(company.getSlug())
                .active(company.isActive())
                .build();
    }

    public BusinessServiceResponse toBusinessServiceResponse(BusinessService service) {
        if (service == null) {
            return null;
        }
        return BusinessServiceResponse.builder()
                .id(service.getId())
                .name(service.getName())
                .description(service.getDescription())
                .price(service.getPrice())
                .durationMinutes(service.getDurationMinutes())
                .active(service.isActive())
                .build();
    }

    public CustomerResponse toCustomerResponse(Customer customer) {
        if (customer == null) {
            return null;
        }
        CustomerResponse.CustomerResponseBuilder builder = CustomerResponse.builder()
                .id(customer.getId())
                .notes(customer.getNotes());

        UserAccount userAccount = customer.getUserAccount();
        if (userAccount != null) {
            builder.fullName(userAccount.getFullName() != null ? userAccount.getFullName() : customer.getFullName());
            builder.email(userAccount.getEmail());
            builder.phoneNumber(userAccount.getPhoneNumber());
        } else {
            builder.fullName(customer.getFullName());
            builder.email(customer.getEmail());
            builder.phoneNumber(customer.getPhoneNumber());
        }

        return builder.build();
    }

    public ProfessionalResponse toProfessionalResponse(Professional professional) {
        if (professional == null) {
            return null;
        }
        ProfessionalResponse.ProfessionalResponseBuilder builder = ProfessionalResponse.builder()
                .id(professional.getId())
                .active(professional.isActive());

        UserAccount userAccount = professional.getUserAccount();
        if (userAccount != null) {
            builder.fullName(userAccount.getFullName());
            builder.email(userAccount.getEmail());
            builder.phoneNumber(userAccount.getPhoneNumber());
        }

        if (professional.getWorkingHours() != null) {
            try {
                // Parse the JSON string to an Object so it's serialized properly by Jackson,
                // or we can just leave it as String and parse it in frontend.
                // Using Object node keeps it clean in JSON response.
                Object workingHoursObj = objectMapper.readValue(professional.getWorkingHours(), Object.class);
                builder.workingHours(workingHoursObj);
            } catch (JsonProcessingException e) {
                builder.workingHours(professional.getWorkingHours());
            }
        }

        return builder.build();
    }

    public AppointmentResponse toAppointmentResponse(Appointment appointment) {
        if (appointment == null) {
            return null;
        }
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .professional(toProfessionalResponse(appointment.getProfessional()))
                .customer(toCustomerResponse(appointment.getCustomer()))
                .service(toBusinessServiceResponse(appointment.getService()))
                .startTime(appointment.getStartTime())
                .endTime(appointment.getEndTime())
                .status(appointment.getStatus() != null ? appointment.getStatus().name() : null)
                .notes(appointment.getNotes())
                .build();
    }
}
