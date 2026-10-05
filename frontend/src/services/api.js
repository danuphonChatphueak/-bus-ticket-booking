// frontend/src/services/api.js
// ==========================================
// MOCK API MODE - สำหรับทดสอบ UI โดยไม่ต้องต่อ Backend
// ==========================================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- Mock Data ---
let mockUsers = [
    { id: 1, name: 'Admin User', email: 'admin@busticket.com', role: 'admin' },
    { id: 2, name: 'Test Passenger', email: 'user@busticket.com', role: 'passenger' }
];

let mockBuses = [
    { id: 1, bus_number: 'BUS-001', bus_type: 'VIP', company_name: 'ไทยพัฒนาทัวร์', total_seats: 40, amenities: 'Wi-Fi, USB Charging, Blanket' },
    { id: 2, bus_number: 'BUS-002', bus_type: 'Standard', company_name: 'ไทยพัฒนาทัวร์', total_seats: 44, amenities: 'Air Condition' },
    { id: 3, bus_number: 'BUS-003', bus_type: 'Express', company_name: 'นครชัยแอร์', total_seats: 30, amenities: 'Wi-Fi, Snack, Massage Seat' },
    { id: 4, bus_number: 'BUS-004', bus_type: 'VIP', company_name: 'สมบัติทัวร์', total_seats: 36, amenities: 'Wi-Fi, USB, Meal' },
    { id: 5, bus_number: 'BUS-005', bus_type: 'Express', company_name: 'บขส.999', total_seats: 40, amenities: 'Air Condition, Snack' },
];

let mockRoutes = [
    { id: 1, origin: 'เชียงใหม่', destination: 'กรุงเทพฯ', distance_km: 696.00 },
    { id: 2, origin: 'กรุงเทพฯ', destination: 'เชียงใหม่', distance_km: 696.00 },
    { id: 3, origin: 'ขอนแก่น', destination: 'กรุงเทพฯ', distance_km: 449.00 },
    { id: 4, origin: 'กรุงเทพฯ', destination: 'ขอนแก่น', distance_km: 449.00 },
    { id: 5, origin: 'ภูเก็ต', destination: 'กรุงเทพฯ', distance_km: 840.00 },
    { id: 6, origin: 'กรุงเทพฯ', destination: 'ภูเก็ต', distance_km: 840.00 },
    { id: 7, origin: 'นครราชสีมา', destination: 'กรุงเทพฯ', distance_km: 260.00 },
];

let mockTrips = [
    // เชียงใหม่ -> กรุงเทพฯ
    { id: 1, bus_id: 1, route_id: 1, origin: 'เชียงใหม่', destination: 'กรุงเทพฯ', travel_date: '2026-10-06', departure_time: '08:00', arrival_time: '18:00', price: 650.00, available_seats: 40, status: 'active', bus_number: 'BUS-001', bus_type: 'VIP', company_name: 'ไทยพัฒนาทัวร์' },
    { id: 2, bus_id: 3, route_id: 1, origin: 'เชียงใหม่', destination: 'กรุงเทพฯ', travel_date: '2026-10-06', departure_time: '19:00', arrival_time: '05:00', price: 750.00, available_seats: 12, status: 'active', bus_number: 'BUS-003', bus_type: 'Express', company_name: 'นครชัยแอร์' },
    { id: 3, bus_id: 4, route_id: 1, origin: 'เชียงใหม่', destination: 'กรุงเทพฯ', travel_date: '2026-10-06', departure_time: '20:30', arrival_time: '06:30', price: 800.00, available_seats: 36, status: 'active', bus_number: 'BUS-004', bus_type: 'VIP', company_name: 'สมบัติทัวร์' },
    { id: 4, bus_id: 2, route_id: 1, origin: 'เชียงใหม่', destination: 'กรุงเทพฯ', travel_date: '2026-10-07', departure_time: '09:00', arrival_time: '19:30', price: 500.00, available_seats: 44, status: 'active', bus_number: 'BUS-002', bus_type: 'Standard', company_name: 'ไทยพัฒนาทัวร์' },

    // กรุงเทพฯ -> เชียงใหม่
    { id: 5, bus_id: 1, route_id: 2, origin: 'กรุงเทพฯ', destination: 'เชียงใหม่', travel_date: '2026-10-06', departure_time: '19:00', arrival_time: '05:00', price: 650.00, available_seats: 5, status: 'active', bus_number: 'BUS-001', bus_type: 'VIP', company_name: 'ไทยพัฒนาทัวร์' },
    { id: 6, bus_id: 3, route_id: 2, origin: 'กรุงเทพฯ', destination: 'เชียงใหม่', travel_date: '2026-10-06', departure_time: '21:00', arrival_time: '07:00', price: 750.00, available_seats: 30, status: 'active', bus_number: 'BUS-003', bus_type: 'Express', company_name: 'นครชัยแอร์' },
    { id: 7, bus_id: 4, route_id: 2, origin: 'กรุงเทพฯ', destination: 'เชียงใหม่', travel_date: '2026-10-07', departure_time: '20:00', arrival_time: '06:00', price: 800.00, available_seats: 25, status: 'active', bus_number: 'BUS-004', bus_type: 'VIP', company_name: 'สมบัติทัวร์' },

    // ขอนแก่น -> กรุงเทพฯ
    { id: 8, bus_id: 5, route_id: 3, origin: 'ขอนแก่น', destination: 'กรุงเทพฯ', travel_date: '2026-10-06', departure_time: '10:00', arrival_time: '17:00', price: 450.00, available_seats: 40, status: 'active', bus_number: 'BUS-005', bus_type: 'Express', company_name: 'บขส.999' },
    { id: 9, bus_id: 3, route_id: 3, origin: 'ขอนแก่น', destination: 'กรุงเทพฯ', travel_date: '2026-10-06', departure_time: '14:00', arrival_time: '21:00', price: 550.00, available_seats: 8, status: 'active', bus_number: 'BUS-003', bus_type: 'Express', company_name: 'นครชัยแอร์' },
    { id: 10, bus_id: 4, route_id: 3, origin: 'ขอนแก่น', destination: 'กรุงเทพฯ', travel_date: '2026-10-07', departure_time: '22:00', arrival_time: '05:00', price: 600.00, available_seats: 36, status: 'active', bus_number: 'BUS-004', bus_type: 'VIP', company_name: 'สมบัติทัวร์' },

    // กรุงเทพฯ -> ขอนแก่น
    { id: 11, bus_id: 5, route_id: 4, origin: 'กรุงเทพฯ', destination: 'ขอนแก่น', travel_date: '2026-10-06', departure_time: '09:00', arrival_time: '16:00', price: 450.00, available_seats: 22, status: 'active', bus_number: 'BUS-005', bus_type: 'Express', company_name: 'บขส.999' },
    { id: 12, bus_id: 4, route_id: 4, origin: 'กรุงเทพฯ', destination: 'ขอนแก่น', travel_date: '2026-10-07', departure_time: '21:30', arrival_time: '04:30', price: 600.00, available_seats: 36, status: 'active', bus_number: 'BUS-004', bus_type: 'VIP', company_name: 'สมบัติทัวร์' },

    // ภูเก็ต -> กรุงเทพฯ
    { id: 13, bus_id: 1, route_id: 5, origin: 'ภูเก็ต', destination: 'กรุงเทพฯ', travel_date: '2026-10-06', departure_time: '16:00', arrival_time: '06:00', price: 950.00, available_seats: 40, status: 'active', bus_number: 'BUS-001', bus_type: 'VIP', company_name: 'ไทยพัฒนาทัวร์' },
    { id: 14, bus_id: 4, route_id: 5, origin: 'ภูเก็ต', destination: 'กรุงเทพฯ', travel_date: '2026-10-06', departure_time: '18:30', arrival_time: '08:30', price: 1050.00, available_seats: 15, status: 'active', bus_number: 'BUS-004', bus_type: 'VIP', company_name: 'สมบัติทัวร์' },
    { id: 15, bus_id: 3, route_id: 5, origin: 'ภูเก็ต', destination: 'กรุงเทพฯ', travel_date: '2026-10-07', departure_time: '17:00', arrival_time: '07:00', price: 980.00, available_seats: 30, status: 'active', bus_number: 'BUS-003', bus_type: 'Express', company_name: 'นครชัยแอร์' },

    // กรุงเทพฯ -> ภูเก็ต
    { id: 16, bus_id: 1, route_id: 6, origin: 'กรุงเทพฯ', destination: 'ภูเก็ต', travel_date: '2026-10-06', departure_time: '17:30', arrival_time: '07:30', price: 950.00, available_seats: 2, status: 'active', bus_number: 'BUS-001', bus_type: 'VIP', company_name: 'ไทยพัฒนาทัวร์' },
    { id: 17, bus_id: 4, route_id: 6, origin: 'กรุงเทพฯ', destination: 'ภูเก็ต', travel_date: '2026-10-07', departure_time: '19:00', arrival_time: '09:00', price: 1050.00, available_seats: 36, status: 'active', bus_number: 'BUS-004', bus_type: 'VIP', company_name: 'สมบัติทัวร์' },

    // นครราชสีมา -> กรุงเทพฯ
    { id: 18, bus_id: 2, route_id: 7, origin: 'นครราชสีมา', destination: 'กรุงเทพฯ', travel_date: '2026-10-06', departure_time: '08:00', arrival_time: '11:30', price: 250.00, available_seats: 44, status: 'active', bus_number: 'BUS-002', bus_type: 'Standard', company_name: 'ไทยพัฒนาทัวร์' },
    { id: 19, bus_id: 5, route_id: 7, origin: 'นครราชสีมา', destination: 'กรุงเทพฯ', travel_date: '2026-10-06', departure_time: '12:00', arrival_time: '15:30', price: 280.00, available_seats: 10, status: 'active', bus_number: 'BUS-005', bus_type: 'Express', company_name: 'บขส.999' },
    { id: 20, bus_id: 2, route_id: 7, origin: 'นครราชสีมา', destination: 'กรุงเทพฯ', travel_date: '2026-10-07', departure_time: '15:00', arrival_time: '18:30', price: 250.00, available_seats: 44, status: 'active', bus_number: 'BUS-002', bus_type: 'Standard', company_name: 'ไทยพัฒนาทัวร์' },
];

let mockBookings = [
    { id: 1, booking_code: 'BK20261005001', user_id: 2, trip_id: 1, travel_date: '2026-10-15', total_price: 650.00, status: 'CONFIRMED', passenger_name: 'Test Passenger', passenger_email: 'user@busticket.com', origin: 'เชียงใหม่', destination: 'กรุงเทพฯ', departure_time: '18:00', arrival_time: '06:00', seat_numbers: '01', bus_number: 'BUS-001', bus_type: 'VIP', company_name: 'ไทยพัฒนาทัวร์' }
];

let mockSeats = Array.from({ length: 40 }, (_, i) => {
    const seatNum = String(i + 1).padStart(2, '0');
    return {
        id: i + 1,
        seat_number: seatNum,
        seat_row: Math.ceil((i + 1) / 2),
        seat_column: (i % 2 === 0) ? 1 : 2,
        status: (i === 0) ? 'booked' : 'available' // Mock seat 01 as booked
    };
});

// --- Auth ---
export const authApi = {
    register: async (body) => {
        await delay(500);
        const newUser = { id: Date.now(), name: body.name, email: body.email, role: 'passenger' };
        mockUsers.push(newUser);
        return { token: 'mock-jwt-token', user: newUser };
    },
    login: async (body) => {
        await delay(500);
        const req = body;
        const user = mockUsers.find(u => u.email === req.email);
        if (user) {
            return { token: 'mock-jwt-token', user };
        }
        throw new Error('Invalid email or password (Try admin@busticket.com or user@busticket.com)');
    },
    getProfile: async () => {
        await delay(300);
        // Returns admin by default if token exists for mock purposes
        return mockUsers[0]; 
    },
};

// --- Buses ---
export const busApi = {
    getAll: async () => { await delay(500); return [...mockBuses]; },
    getById: async (id) => { await delay(300); return mockBuses.find(b => b.id == id); },
    create: async (body) => { await delay(500); mockBuses.push({ id: Date.now(), ...body }); return {}; },
    update: async (id, body) => { await delay(500); const index = mockBuses.findIndex(b => b.id == id); if(index > -1) mockBuses[index] = { ...mockBuses[index], ...body }; return {}; },
    delete: async (id) => { await delay(500); mockBuses = mockBuses.filter(b => b.id != id); return {}; },
};

// --- Routes ---
export const routeApi = {
    getAll: async () => { await delay(500); return [...mockRoutes]; },
    getById: async (id) => { await delay(300); return mockRoutes.find(r => r.id == id); },
    create: async (body) => { await delay(500); mockRoutes.push({ id: Date.now(), ...body }); return {}; },
    update: async (id, body) => { await delay(500); const index = mockRoutes.findIndex(r => r.id == id); if(index > -1) mockRoutes[index] = { ...mockRoutes[index], ...body }; return {}; },
    delete: async (id) => { await delay(500); mockRoutes = mockRoutes.filter(r => r.id != id); return {}; },
};

// --- Trips ---
export const tripApi = {
    getAll: async (params = {}) => { 
        await delay(500); 
        let result = [...mockTrips];
        if (params.origin) result = result.filter(t => t.origin === params.origin);
        if (params.destination) result = result.filter(t => t.destination === params.destination);
        if (params.travel_date) result = result.filter(t => t.travel_date === params.travel_date);
        return result;
    },
    getById: async (id) => { await delay(300); return mockTrips.find(t => t.id == id); },
    getSeats: async (id) => { await delay(500); return { trip_id: id, bus_type: 'VIP', total_seats: 40, seats: [...mockSeats] }; },
    create: async (body) => { await delay(500); mockTrips.push({ id: Date.now(), ...body }); return {}; },
    update: async (id, body) => { await delay(500); const index = mockTrips.findIndex(t => t.id == id); if(index > -1) mockTrips[index] = { ...mockTrips[index], ...body }; return {}; },
    delete: async (id) => { await delay(500); mockTrips = mockTrips.filter(t => t.id != id); return {}; },
};

// --- Bookings ---
export const bookingApi = {
    getAll: async () => { await delay(500); return [...mockBookings]; },
    getById: async (id) => { await delay(300); return mockBookings.find(b => b.id == id) || mockBookings[0]; },
    create: async (body) => { 
        await delay(1000); 
        const req = body;
        const newBooking = {
            id: Date.now(),
            booking_code: `BK${Date.now()}`,
            user_id: 2,
            trip_id: req.trip_id,
            travel_date: '2026-10-15',
            total_price: req.seat_ids.length * 650,
            status: 'CONFIRMED',
            passenger_name: 'Test Passenger',
            origin: 'เชียงใหม่',
            destination: 'กรุงเทพฯ',
            departure_time: '18:00',
            bus_number: 'BUS-001',
            bus_type: 'VIP',
            company_name: 'ไทยพัฒนาทัวร์',
            seat_numbers: req.seat_ids.map(id => String(id).padStart(2, '0')).join(', ')
        };
        mockBookings.unshift(newBooking);
        return { booking: newBooking }; 
    },
    cancel: async (id) => { 
        await delay(500); 
        const b = mockBookings.find(b => b.id == id);
        if (b) b.status = 'CANCELLED';
        return {}; 
    },
    updateStatus: async (id, status) => {
        await delay(500);
        const b = mockBookings.find(b => b.id == id);
        if (b) b.status = status;
        return {};
    },
};

// --- Admin ---
export const adminApi = {
    getDashboard: async () => { 
        await delay(500); 
        return {
            total_buses: mockBuses.length,
            total_trips: mockTrips.length,
            total_bookings: mockBookings.filter(b => b.status === 'CONFIRMED').length,
            total_passengers: mockUsers.length - 1,
            total_revenue: mockBookings.filter(b => b.status === 'CONFIRMED').reduce((acc, cur) => acc + cur.total_price, 0)
        };
    },
    getUsers: async () => { await delay(500); return [...mockUsers]; },
};
