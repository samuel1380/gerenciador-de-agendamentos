# Examples of Requests (Curl)

Use these commands to test the API locally.
URL: http://localhost:3000

## 1. Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Maria Silva", "email": "maria@example.com", "phone": "11999999999", "password": "123"}'
```
*Save the returned `token` for next steps.*

## 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "maria@example.com", "password": "123"}'
```

## 3. List Services
```bash
curl http://localhost:3000/api/services
```

## 4. Get Schedules (Availability) for tomorrow
*(Replace 2024-XX-XX with a date)*
```bash
curl "http://localhost:3000/api/schedules?date=2025-12-09&service_id=1"
```

## 5. Book Appointment
*(Replace TOKEN with your JWT)*
```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"service_id": 1, "date": "2025-12-09", "time": "09:00", "note": "Quero francesinha"}'
```

## 6. List My Appointments
```bash
curl http://localhost:3000/api/appointments/me \
  -H "Authorization: Bearer TOKEN"
```

## 7. Admin: List All Appointments
```bash
curl http://localhost:3000/api/admin/appointments
```

## 8. Admin: Accept Appointment
*(Replace ID with appointment ID)*
```bash
curl -X PUT http://localhost:3000/api/admin/appointments/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "accepted"}'
```

## 9. Admin: Block Schedule
```bash
curl -X POST http://localhost:3000/api/schedules \
  -H "Content-Type: application/json" \
  -d '{"date": "2025-12-24", "time": "10:00", "available": false, "slot_label": "Natal"}'
```
