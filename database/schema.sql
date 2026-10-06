-- ============================================================
-- Bus Ticket Booking System - Azure SQL Database Schema
-- ============================================================

-- Drop tables in reverse dependency order if they exist
IF OBJECT_ID('dbo.booking_seats', 'U') IS NOT NULL DROP TABLE dbo.booking_seats;
IF OBJECT_ID('dbo.bookings', 'U') IS NOT NULL DROP TABLE dbo.bookings;
IF OBJECT_ID('dbo.seats', 'U') IS NOT NULL DROP TABLE dbo.seats;
IF OBJECT_ID('dbo.trips', 'U') IS NOT NULL DROP TABLE dbo.trips;
IF OBJECT_ID('dbo.routes', 'U') IS NOT NULL DROP TABLE dbo.routes;
IF OBJECT_ID('dbo.buses', 'U') IS NOT NULL DROP TABLE dbo.buses;
IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;

-- ============================================================
-- Table: users
-- ============================================================
CREATE TABLE dbo.users (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    name          NVARCHAR(100)  NOT NULL,
    email         NVARCHAR(150)  NOT NULL UNIQUE,
    password_hash NVARCHAR(255)  NOT NULL,
    role          NVARCHAR(20)   NOT NULL DEFAULT 'passenger'  -- 'passenger' | 'admin'
                  CHECK (role IN ('passenger', 'admin')),
    created_at    DATETIME2      NOT NULL DEFAULT GETDATE(),
    updated_at    DATETIME2      NOT NULL DEFAULT GETDATE()
);

-- ============================================================
-- Table: buses
-- ============================================================
CREATE TABLE dbo.buses (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    bus_number   NVARCHAR(50)   NOT NULL UNIQUE,
    bus_type     NVARCHAR(50)   NOT NULL,   -- e.g. 'VIP', 'Standard', 'Express'
    company_name NVARCHAR(100)  NOT NULL,
    total_seats  INT            NOT NULL CHECK (total_seats > 0),
    amenities    NVARCHAR(500)  NULL,
    created_at   DATETIME2      NOT NULL DEFAULT GETDATE(),
    updated_at   DATETIME2      NOT NULL DEFAULT GETDATE()
);

-- ============================================================
-- Table: seats  (one row per physical seat per bus)
-- ============================================================
CREATE TABLE dbo.seats (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    bus_id      INT            NOT NULL REFERENCES dbo.buses(id) ON DELETE CASCADE,
    seat_number NVARCHAR(10)   NOT NULL,    -- e.g. '01', '02' … '40'
    seat_row    INT            NOT NULL,
    seat_column INT            NOT NULL,
    CONSTRAINT uq_seat_bus UNIQUE (bus_id, seat_number)
);

-- ============================================================
-- Table: routes
-- ============================================================
CREATE TABLE dbo.routes (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    origin      NVARCHAR(100)  NOT NULL,
    destination NVARCHAR(100)  NOT NULL,
    distance_km DECIMAL(8,2)   NULL,
    created_at  DATETIME2      NOT NULL DEFAULT GETDATE(),
    updated_at  DATETIME2      NOT NULL DEFAULT GETDATE(),
    CONSTRAINT uq_route UNIQUE (origin, destination)
);

-- ============================================================
-- Table: trips
-- ============================================================
CREATE TABLE dbo.trips (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    bus_id          INT            NOT NULL REFERENCES dbo.buses(id),
    route_id        INT            NOT NULL REFERENCES dbo.routes(id),
    travel_date     DATE           NOT NULL,
    departure_time  TIME           NOT NULL,
    arrival_time    TIME           NOT NULL,
    price           DECIMAL(10,2)  NOT NULL CHECK (price >= 0),
    available_seats INT            NOT NULL CHECK (available_seats >= 0),
    status          NVARCHAR(20)   NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'cancelled', 'completed')),
    created_at      DATETIME2      NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2      NOT NULL DEFAULT GETDATE()
);

-- ============================================================
-- Table: bookings
-- ============================================================
CREATE TABLE dbo.bookings (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    booking_code NVARCHAR(30)   NOT NULL UNIQUE,
    user_id      INT            NOT NULL REFERENCES dbo.users(id),
    trip_id      INT            NOT NULL REFERENCES dbo.trips(id),
    travel_date  DATE           NOT NULL,
    total_price  DECIMAL(10,2)  NOT NULL CHECK (total_price >= 0),
    status       NVARCHAR(20)   NOT NULL DEFAULT 'CONFIRMED'
                 CHECK (status IN ('CONFIRMED', 'CANCELLED')),
    created_at   DATETIME2      NOT NULL DEFAULT GETDATE(),
    updated_at   DATETIME2      NOT NULL DEFAULT GETDATE()
);

-- ============================================================
-- Table: booking_seats  (which seat(s) each booking occupies)
-- ============================================================
CREATE TABLE dbo.booking_seats (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    booking_id  INT NOT NULL REFERENCES dbo.bookings(id) ON DELETE CASCADE,
    seat_id     INT NOT NULL REFERENCES dbo.seats(id),
    trip_id     INT NOT NULL REFERENCES dbo.trips(id)
);

-- ============================================================
-- Indexes for common query patterns
-- ============================================================
CREATE INDEX ix_trips_route_date   ON dbo.trips (route_id, travel_date);
CREATE INDEX ix_trips_bus          ON dbo.trips (bus_id);
CREATE INDEX ix_bookings_user      ON dbo.bookings (user_id);
CREATE INDEX ix_bookings_trip      ON dbo.bookings (trip_id);
CREATE INDEX ix_booking_seats_trip ON dbo.booking_seats (trip_id);
CREATE INDEX ix_seats_bus          ON dbo.seats (bus_id);

-- ============================================================
-- Seed: default admin account  (change password in production)
-- password_hash below is bcrypt of 'Admin@1234'
-- ============================================================
INSERT INTO dbo.users (name, email, password_hash, role)
VALUES (
    N'System Admin',
    'admin@busticket.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpfQN8yUHjZNpC',
    'admin'
);

-- ============================================================
-- Seed: sample buses
-- ============================================================
INSERT INTO dbo.buses (bus_number, bus_type, company_name, total_seats, amenities)
VALUES
    ('BUS-001', N'VIP', N'ไทยพัฒนาทัวร์', 40, N'Wi-Fi, USB Charging, Blanket'),
    ('BUS-002', N'Standard', N'ไทยพัฒนาทัวร์', 44, N'Air Condition'),
    ('BUS-003', N'Express', N'นครชัยแอร์', 30, N'Wi-Fi, Snack'),
    ('BUS-004', N'VIP', N'นครชัยแอร์', 36, N'Wi-Fi, USB Charging, Meal');

-- ============================================================
-- Seed: seats for BUS-001 (40 seats, 2 cols)
-- ============================================================
DECLARE @bus1 INT = (SELECT id FROM dbo.buses WHERE bus_number = 'BUS-001');
DECLARE @i INT = 1;
WHILE @i <= 40
BEGIN
    INSERT INTO dbo.seats (bus_id, seat_number, seat_row, seat_column)
    VALUES (
        @bus1,
        RIGHT('0' + CAST(@i AS VARCHAR), 2),
        CEILING(CAST(@i AS FLOAT) / 2),
        CASE WHEN @i % 2 = 1 THEN 1 ELSE 2 END
    );
    SET @i = @i + 1;
END;

-- Seed: seats for BUS-002 (44 seats)
DECLARE @bus2 INT = (SELECT id FROM dbo.buses WHERE bus_number = 'BUS-002');
SET @i = 1;
WHILE @i <= 44
BEGIN
    INSERT INTO dbo.seats (bus_id, seat_number, seat_row, seat_column)
    VALUES (
        @bus2,
        RIGHT('0' + CAST(@i AS VARCHAR), 2),
        CEILING(CAST(@i AS FLOAT) / 2),
        CASE WHEN @i % 2 = 1 THEN 1 ELSE 2 END
    );
    SET @i = @i + 1;
END;

-- Seed: seats for BUS-003 (30 seats)
DECLARE @bus3 INT = (SELECT id FROM dbo.buses WHERE bus_number = 'BUS-003');
SET @i = 1;
WHILE @i <= 30
BEGIN
    INSERT INTO dbo.seats (bus_id, seat_number, seat_row, seat_column)
    VALUES (
        @bus3,
        RIGHT('0' + CAST(@i AS VARCHAR), 2),
        CEILING(CAST(@i AS FLOAT) / 2),
        CASE WHEN @i % 2 = 1 THEN 1 ELSE 2 END
    );
    SET @i = @i + 1;
END;

-- Seed: seats for BUS-004 (36 seats)
DECLARE @bus4 INT = (SELECT id FROM dbo.buses WHERE bus_number = 'BUS-004');
SET @i = 1;
WHILE @i <= 36
BEGIN
    INSERT INTO dbo.seats (bus_id, seat_number, seat_row, seat_column)
    VALUES (
        @bus4,
        RIGHT('0' + CAST(@i AS VARCHAR), 2),
        CEILING(CAST(@i AS FLOAT) / 2),
        CASE WHEN @i % 2 = 1 THEN 1 ELSE 2 END
    );
    SET @i = @i + 1;
END;

-- ============================================================
-- Seed: sample routes
-- ============================================================
INSERT INTO dbo.routes (origin, destination, distance_km) VALUES
    (N'เชียงใหม่', N'กรุงเทพฯ', 696.00),
    (N'กรุงเทพฯ', N'เชียงใหม่', 696.00),
    (N'กรุงเทพฯ', N'เชียงราย', 785.00),
    (N'เชียงราย', N'กรุงเทพฯ', 785.00),
    (N'กรุงเทพฯ', N'ขอนแก่น', 449.00),
    (N'ขอนแก่น', N'กรุงเทพฯ', 449.00),
    (N'กรุงเทพฯ', N'อุดรธานี', 564.00),
    (N'อุดรธานี', N'กรุงเทพฯ', 564.00),
    (N'กรุงเทพฯ', N'หาดใหญ่', 990.00),
    (N'หาดใหญ่', N'กรุงเทพฯ', 990.00);

-- ============================================================
-- Seed: sample trips (travel_date in the future relative to schema creation)
-- ============================================================
INSERT INTO dbo.trips (bus_id, route_id, travel_date, departure_time, arrival_time, price, available_seats)
VALUES
    (1, 1, '2026-10-15', '18:00', '06:00', 650.00, 40),
    (1, 1, '2026-10-16', '20:00', '08:00', 650.00, 40),
    (2, 2, '2026-10-15', '19:00', '07:30', 500.00, 44),
    (3, 5, '2026-10-15', '21:00', '05:00', 450.00, 30),
    (4, 6, '2026-10-16', '20:30', '05:30', 480.00, 36),
    (1, 9, '2026-10-17', '17:00', '08:00', 750.00, 40),
    (3, 3, '2026-10-15', '22:00', '11:00', 700.00, 30);
