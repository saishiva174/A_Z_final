-- Create the Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) NOT NULL,             -- 'admin', 'professional', 'customer'
    is_approved BOOLEAN DEFAULT FALSE,     -- Safety gate
    profile_pic_url TEXT,
    id_document_url TEXT,                  -- For Admin to verify Pros
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
    pro_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE job_attachments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL, -- Path to the image on your server or S3
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    pro_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL,
    description TEXT,
    budget NUMERIC(10, 2) NOT NULL,
    location VARCHAR(255),
    preferred_time VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending', -- options: 'pending', 'accepted', 'declined', 'completed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE booking_images (
    id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- This ensures if a booking is deleted, the images are cleaned up
    CONSTRAINT fk_booking 
        FOREIGN KEY(booking_id) 
        REFERENCES bookings(id) 
        ON DELETE CASCADE
);