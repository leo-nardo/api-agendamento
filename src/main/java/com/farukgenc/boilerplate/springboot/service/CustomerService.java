package com.farukgenc.boilerplate.springboot.service;

import com.farukgenc.boilerplate.springboot.model.Customer;
import com.farukgenc.boilerplate.springboot.model.UserAccount;
import com.farukgenc.boilerplate.springboot.repository.CustomerRepository;
import com.farukgenc.boilerplate.springboot.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserAccountRepository userAccountRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    public List<Customer> findAll() {
        return customerRepository.findAll();
    }

    public List<Customer> findAllByCompanyId(UUID companyId) {
        return customerRepository.findByCompanyId(companyId);
    }

    public Customer findById(UUID id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }

    public Customer create(Customer customer) {
        return customerRepository.save(customer);
    }

    @Transactional
    public Customer createFromRequest(com.farukgenc.boilerplate.springboot.security.dto.CreateCustomerRequest request,
            java.util.UUID companyId) {
        // Find existing user or create
        UserAccount user = userAccountRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    UserAccount newUser = UserAccount.builder()
                            .email(request.getEmail())
                            .fullName(request.getFullName())
                            .phoneNumber(request.getPhoneNumber())
                            .password(bCryptPasswordEncoder.encode("cliente123")) // Default password
                            .active(true)
                            .build();
                    return userAccountRepository.save(newUser);
                });

        Customer customer = Customer.builder()
                .userAccount(user)
                .companyId(companyId)
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .build();
        return customerRepository.save(customer);
    }

    @Transactional
    public Customer registerGuest(UUID companyId, String email, String password) {
        Customer customer = customerRepository.findByEmailAndCompanyId(email, companyId)
                .orElseThrow(() -> new RuntimeException("Guest not found"));

        if (customer.getUserAccount() != null) {
            throw new RuntimeException("User already registered");
        }

        UserAccount user = UserAccount.builder()
                .email(email)
                .password(bCryptPasswordEncoder.encode(password))
                .fullName(customer.getFullName())
                .phoneNumber(customer.getPhoneNumber())
                .active(true)
                .build();

        user = userAccountRepository.save(user);

        customer.setUserAccount(user);
        return customerRepository.save(customer);
    }
}
