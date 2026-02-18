-- Liquibase formatted sql

-- changeset leo-nardo:1
-- Comment: Create initial multi-tenant structure

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE company (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legal_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    tax_id VARCHAR(50),
    settings_json JSONB,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_account (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE company_user (
    user_id UUID NOT NULL,
    company_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (user_id, company_id),
    CONSTRAINT fk_company_user_user FOREIGN KEY (user_id) REFERENCES user_account(id),
    CONSTRAINT fk_company_user_company FOREIGN KEY (company_id) REFERENCES company(id)
);

CREATE TABLE business_service (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_minutes INT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT fk_bservice_company FOREIGN KEY (company_id) REFERENCES company(id)
);

CREATE TABLE professional (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    user_account_id UUID NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT fk_professional_company FOREIGN KEY (company_id) REFERENCES company(id),
    CONSTRAINT fk_professional_user FOREIGN KEY (user_account_id) REFERENCES user_account(id),
    CONSTRAINT uq_professional_company_user UNIQUE (company_id, user_account_id)
);

-- 6. Create Domain Entity: Customer
-- Customers can be linked to a global user_account OR just be a local record (walk-in).
CREATE TABLE customer (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    user_account_id UUID,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone_number VARCHAR(20),
    notes TEXT,
    
    CONSTRAINT fk_customer_company FOREIGN KEY (company_id) REFERENCES company(id),
    CONSTRAINT fk_customer_user FOREIGN KEY (user_account_id) REFERENCES user_account(id)
);

CREATE TABLE appointment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    professional_id UUID NOT NULL,
    customer_id UUID,
    service_id UUID,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_appointment_company FOREIGN KEY (company_id) REFERENCES company(id),
    CONSTRAINT fk_appointment_professional FOREIGN KEY (professional_id) REFERENCES professional(id),
    CONSTRAINT fk_appointment_customer FOREIGN KEY (customer_id) REFERENCES customer(id),
    CONSTRAINT fk_appointment_service FOREIGN KEY (service_id) REFERENCES business_service(id)
);

CREATE INDEX idx_appointment_company ON appointment(company_id);
CREATE INDEX idx_appointment_professional_start ON appointment(professional_id, start_time);
