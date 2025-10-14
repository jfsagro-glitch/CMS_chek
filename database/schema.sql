-- Создание базы данных CMS Check
CREATE DATABASE cms_check;

-- Таблица пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(255),
    role VARCHAR(50) DEFAULT 'inspector',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица осмотров
CREATE TABLE inspections (
    id SERIAL PRIMARY KEY,
    internal_number VARCHAR(50),
    property_type VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    inspector_name VARCHAR(255) NOT NULL,
    inspector_phone VARCHAR(20) NOT NULL,
    inspector_email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'В работе',
    comment TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    access_token VARCHAR(255) UNIQUE,
    token_expires_at TIMESTAMP
);

-- Таблица объектов осмотра
CREATE TABLE inspection_objects (
    id SERIAL PRIMARY KEY,
    inspection_id INTEGER REFERENCES inspections(id) ON DELETE CASCADE,
    vin VARCHAR(17),
    registration_number VARCHAR(20),
    category VARCHAR(100),
    type VARCHAR(100),
    make VARCHAR(100),
    model VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица фотографий
CREATE TABLE photos (
    id SERIAL PRIMARY KEY,
    inspection_id INTEGER REFERENCES inspections(id) ON DELETE CASCADE,
    object_id INTEGER REFERENCES inspection_objects(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    file_path TEXT NOT NULL,
    file_size INTEGER,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    device_id VARCHAR(255),
    taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица истории статусов
CREATE TABLE status_history (
    id SERIAL PRIMARY KEY,
    inspection_id INTEGER REFERENCES inspections(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INTEGER REFERENCES users(id),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_inspections_created_at ON inspections(created_at);
CREATE INDEX idx_inspections_created_by ON inspections(created_by);
CREATE INDEX idx_photos_inspection_id ON photos(inspection_id);
CREATE INDEX idx_photos_object_id ON photos(object_id);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON inspections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
