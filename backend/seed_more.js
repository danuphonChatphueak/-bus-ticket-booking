const { getPool, sql } = require('./src/config/database');

const provinces = [
  'กระบี่', 'กรุงเทพฯ', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท',
  'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม',
  'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน', 'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์',
  'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พังงา', 'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่',
  'พะเยา', 'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน', 'ยะลา', 'ยโสธร', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง',
  'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ',
  'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย',
  'หนองบัวลำภู', 'อ่างทอง', 'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี'
];

async function seed() {
    try {
        const pool = await getPool();
        let insertedRoutes = 0;
        let insertedTrips = 0;

        for (let i = 0; i < 50; i++) {
            const origin = provinces[Math.floor(Math.random() * provinces.length)];
            let destination = provinces[Math.floor(Math.random() * provinces.length)];
            while (destination === origin) {
                destination = provinces[Math.floor(Math.random() * provinces.length)];
            }
            const distance = Math.floor(Math.random() * 800) + 100;
            const price = Math.floor(Math.random() * 500) + 300;
            const busId = Math.floor(Math.random() * 4) + 1;
            const travelDate = '2026-10-' + (Math.floor(Math.random() * 10) + 10).toString();
            const deptHour = Math.floor(Math.random() * 12) + 6;
            const deptTime = deptHour.toString().padStart(2, '0') + ':00';
            const arrHour = deptHour + Math.floor(Math.random() * 5) + 3;
            const arrTime = (arrHour % 24).toString().padStart(2, '0') + ':00';

            let routeResult = await pool.request()
                .input('origin', sql.NVarChar, origin)
                .input('destination', sql.NVarChar, destination)
                .query('SELECT id FROM dbo.routes WHERE origin = @origin AND destination = @destination');

            let routeId;
            if (routeResult.recordset.length > 0) {
                routeId = routeResult.recordset[0].id;
            } else {
                let insertRoute = await pool.request()
                    .input('origin', sql.NVarChar, origin)
                    .input('destination', sql.NVarChar, destination)
                    .input('dist', sql.Decimal, distance)
                    .query('INSERT INTO dbo.routes (origin, destination, distance_km) OUTPUT INSERTED.id VALUES (@origin, @destination, @dist)');
                routeId = insertRoute.recordset[0].id;
                insertedRoutes++;
            }

            await pool.request()
                .input('bus_id', sql.Int, busId)
                .input('route_id', sql.Int, routeId)
                .input('travel_date', sql.VarChar, travelDate)
                .input('departure_time', sql.VarChar, deptTime)
                .input('arrival_time', sql.VarChar, arrTime)
                .input('price', sql.Decimal, price)
                .input('available_seats', sql.Int, 40)
                .query('INSERT INTO dbo.trips (bus_id, route_id, travel_date, departure_time, arrival_time, price, available_seats) VALUES (@bus_id, @route_id, @travel_date, @departure_time, @arrival_time, @price, @available_seats)');
            
            insertedTrips++;
        }
        
        console.log('Successfully seeded ' + insertedRoutes + ' new routes and ' + insertedTrips + ' trips!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
}

seed();
