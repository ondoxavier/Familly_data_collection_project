-- Schéma logique cible

CREATE TABLE branches (
    id VARCHAR PRIMARY KEY,
    branch_name VARCHAR(255) NOT NULL,
    root_person_name VARCHAR(255),
    collector_name VARCHAR(255),
    collector_phone VARCHAR(50),
    collector_email VARCHAR(255),
    access_token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE persons (
    id VARCHAR PRIMARY KEY,
    branch_id VARCHAR NOT NULL REFERENCES branches(id),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    gender VARCHAR(20),
    birth_date DATE,
    birth_date_text VARCHAR(100),
    birth_place VARCHAR(255),
    is_alive BOOLEAN,
    death_date DATE,
    death_date_text VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE unions (
    id VARCHAR PRIMARY KEY,
    branch_id VARCHAR NOT NULL REFERENCES branches(id),
    partner_1_id VARCHAR NOT NULL REFERENCES persons(id),
    partner_2_id VARCHAR NOT NULL REFERENCES persons(id),
    union_type VARCHAR(100),
    start_date_text VARCHAR(100),
    end_date_text VARCHAR(100),
    notes TEXT
);

CREATE TABLE parent_child_links (
    id VARCHAR PRIMARY KEY,
    branch_id VARCHAR NOT NULL REFERENCES branches(id),
    parent_id VARCHAR NOT NULL REFERENCES persons(id),
    child_id VARCHAR NOT NULL REFERENCES persons(id),
    link_type VARCHAR(50) DEFAULT 'biological',
    certainty VARCHAR(50) DEFAULT 'confirmed',
    notes TEXT
);

CREATE TABLE remarks (
    id VARCHAR PRIMARY KEY,
    branch_id VARCHAR NOT NULL REFERENCES branches(id),
    person_id VARCHAR REFERENCES persons(id),
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'to_verify',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
