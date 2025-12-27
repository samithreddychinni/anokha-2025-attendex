# Anokha 2025 Backend API Documentation

**Base URL:** `http://localhost:8080`  
**API Version:** v1  
**Prefix:** `/api/v1`

---

## Table of Contents
- [Authentication](#authentication)
    - [Student Auth](#student-auth)
    - [Organizer Auth](#organizer-auth)
    - [Admin Auth](#admin-auth)
- [Events](#events)
    - [Public Endpoints](#public-endpoints)
    - [Admin Event Management](#admin-event-management)
- [Booking](#booking)
- [Profile](#profile)
- [Tags](#tags)
- [People](#people)
- [Organizers](#organizers)
- [Attendance](#attendance)
- [Analytics](#analytics)

---

## Authentication

### Student Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/user/check` | Check if email exists | No |
| GET | `/auth/user/login` | Get CSRF token for login | No |
| POST | `/auth/user/login` | Login user | CSRF |
| GET | `/auth/user/register` | Get CSRF token for registration | No |
| POST | `/auth/user/register` | Register new student account | CSRF |
| GET | `/auth/user/register/otp/verify` | Get CSRF token for OTP verify | No |
| POST | `/auth/user/register/otp/verify` | Verify OTP for registration | CSRF + Temp |
| GET | `/auth/user/register/otp/resend` | Resend OTP | Temp |
| GET | `/auth/user/forgot-password` | Get CSRF for password reset | No |
| POST | `/auth/user/forgot-password` | Initiate password reset | CSRF |
| GET | `/auth/user/forgot-password/otp/verify` | Get CSRF for OTP verify | No |
| POST | `/auth/user/forgot-password/otp/verify` | Confirm password change | CSRF + Temp |
| GET | `/auth/user/forgot-password/otp/resend` | Resend password OTP | Temp |
| GET | `/auth/user/session` | Fetch user session | Yes User |
| GET | `/auth/user/logout` | Logout user | Yes User |

#### Check Email
**POST** `/auth/user/check`
```json
{
  "email": "user@example.com"
}
```
**Response:**
`200 OK` - `{ "message": "Email is available." }`
`409 Conflict` - `{ "message": "Email already registered." }`

#### Login
**POST** `/auth/user/login`
*Headers:* `X-Csrf-Token: <token>`
```json
{
  "email": "user@example.com",
  "password": "hashedPassword"
}
```
**Response:**
```json
{
  "message": "User logged in successfully",
  "name": "John Doe",
  "email": "user@example.com"
}
```

#### Register
**POST** `/auth/user/register`
*Headers:* `X-Csrf-Token: <token>`
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "phone_number": "9876543210",
  "is_amrita_student": true,
  "amrita_roll_number": "CB.EN.U4CSE21001",
  "college_name": "Amrita University",
  "college_city": "Coimbatore"
}
```
**Response:**
```json
{
  "message": "User onboarding initiated. OTP sent to email.",
  "expiry_at": "2025-01-01T12:00:00Z"
}
```

#### Verify OTP
**POST** `/auth/user/register/otp/verify`
*Headers:* `X-Csrf-Token: <token>`
```json
{
  "otp": "123456"
}
```

#### Forgot Password - Initiate
**POST** `/auth/user/forgot-password`
*Headers:* `X-Csrf-Token: <token>`
```json
{
  "email": "user@example.com",
  "new_password": "newHashedPassword"
}
```

#### Forgot Password - Verify OTP
**POST** `/auth/user/forgot-password/otp/verify`
*Headers:* `X-Csrf-Token: <token>`
```json
{
  "otp": "123456"
}
```

---

### Organizer Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/organizer/login` | Login organizer | No |
| GET | `/auth/organizer/logout` | Logout organizer | Yes Organizer |
| GET | `/auth/organizer/session` | Fetch organizer session | Yes Organizer |

#### Login
**POST** `/auth/organizer/login`
```json
{
  "email": "dept@amrita.edu",
  "password": "hashedPassword"
}
```

---

### Admin Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/admin/login` | Login admin | No |
| GET | `/auth/admin/logout` | Logout admin | Yes Admin |
| GET | `/auth/admin/session` | Fetch admin session | Yes Admin |

#### Login
**POST** `/auth/admin/login`
```json
{
  "email": "admin@gmail.com",
  "password": "password"
}
```

---

## Events

### Public Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/events/` | Fetch all published events | No |
| GET | `/events/:eventId` | Fetch event by ID | No |
| GET | `/events/auth/` | Fetch all events (with user context) | Yes User |
| GET | `/events/auth/:eventId` | Fetch event by ID (with user context) | Yes User |
| PUT | `/events/favourite/:eventId` | Star/favourite an event | Yes User |
| DELETE | `/events/favourite/:eventId` | Unstar/unfavourite an event | Yes User |

### Admin Event Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/events/admin` | Get all admin events | Yes Admin |
| GET | `/events/admin/:eventId` | Get admin event by ID | Yes Admin |
| GET | `/events/admin/new` | Create new event (get blank) | Yes Admin |
| POST | `/events/admin/details/:eventId` | Add event details | Yes Admin |
| POST | `/events/admin/poster/:eventId` | Upload event poster | Yes Admin |
| DELETE | `/events/admin/poster/:eventId` | Delete event poster | Yes Admin |
| POST | `/events/admin/size/:eventId` | Set team size dimensions | Yes Admin |
| POST | `/events/admin/toggle/:eventId` | Toggle event settings | Yes Admin |
| POST | `/events/admin/organizer` | Connect organizer to event | Yes Admin |
| DELETE | `/events/admin/organizer` | Disconnect organizer | Yes Admin |
| POST | `/events/admin/tag` | Connect tags to event | Yes Admin |
| DELETE | `/events/admin/tag` | Disconnect tags | Yes Admin |
| POST | `/events/admin/people` | Connect people to event | Yes Admin |
| DELETE | `/events/admin/people` | Disconnect people | Yes Admin |
| POST | `/events/admin/schedule/:eventId` | Add event schedule | Yes Admin |
| PUT | `/events/admin/schedule/:scheduleId` | Edit event schedule | Yes Admin |
| DELETE | `/events/admin/schedule/:scheduleId` | Delete schedule | Yes Admin |
| POST | `/events/admin/publish/:eventId` | Publish event | Yes Admin |
| DELETE | `/events/admin/publish/:eventId` | Unpublish event | Yes Admin |
| POST | `/events/admin/completed/:eventId` | Mark as completed | Yes Admin |
| DELETE | `/events/admin/completed/:eventId` | Unmark as completed | Yes Admin |

#### Update Event Details
**POST** `/events/admin/details/:eventId`
```json
{
  "name": "AI Hackathon",
  "blurb": "24hr Hackathon",
  "description": "Full description...",
  "rules": "No plagiarism",
  "price": 150,
  "is_per_head": true
}
```

#### Update Event Dimensions
**POST** `/events/admin/size/:eventId`
```json
{
  "is_group": true,
  "min_teamsize": 2,
  "max_teamsize": 5,
  "total_seats": 100,
  "is_per_head": true
}
```

#### Update Event Toggles
**POST** `/events/admin/toggle/:eventId`
```json
{
  "event_type": "EVENT",  // or "WORKSHOP"
  "attendance_mode": "SOLO", // or "DUO"
  "is_offline": true,
  "is_technical": true
}
```

#### Add Schedule
**POST** `/events/admin/schedule/:eventId`
```json
{
  "event_date": "2025-03-15T00:00:00Z",
  "start_time": "2025-03-15T09:00:00Z",
  "end_time": "2025-03-15T17:00:00Z",
  "venue": "Main Auditorium"
}
```

#### Add Poster
**POST** `/events/admin/poster/:eventId`
```json
{
  "poster_url": "https://example.com/image.png"
}
```

#### Connect/Disconnect Entity (Organizer/People/Tag)
**POST/DELETE** `/events/admin/organizer` (or `/people`, `/tag`)
```json
{
  "id": "event_uuid",
  "organizer_id": "organizer_uuid" // or "person_id" or "tag_id"
}
```

---

## Booking

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/events/:eventId/book` | Get CSRF token for booking | Yes User |
| POST | `/events/:eventId/book` | Book an event | Yes User + CSRF |
| POST | `/events/verify` | Verify transaction | Yes User |
| GET | `/events/transactions` | Fetch admin transactions | Yes Admin |

#### Book Event (Team/Solo)
**POST** `/events/:eventId/book`
*Headers:* `X-Csrf-Token: <token>`
```json
{
  "team_name": "Code Warriors",
  "team_members": [
    {
      "student_email": "teammate@example.com",
      "student_role": "Developer"
    }
  ],
  "ps": "generative_ai" // optional, for specific events
}
```
*Note: For solo events, `team_members` can be empty or omitted if logic allows, but typically booking follows user context.*

#### Verify Transaction
**POST** `/events/verify`
```json
{
  "txnId": "txn_123456",
  "status": "SUCCESS" // or "FAILURE"
}
```

---

## Profile

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/user/profile` | Fetch user profile | Yes User |
| GET | `/user/profile/edit` | Get CSRF for profile edit | Yes User |
| POST | `/user/profile/edit` | Update user profile | Yes User + CSRF |
| GET | `/user/profile/transactions` | Get user transactions | Yes User |
| GET | `/user/profile/tickets` | Get user tickets | Yes User |

#### Edit Profile
**POST** `/user/profile/edit`
*Headers:* `X-Csrf-Token: <token>`
```json
{
  "name": "John Doe",
  "phone_number": "9876543210",
  "college_name": "Amrita University",
  "college_city": "Coimbatore"
}
```

---

## Organizers

### Management (Admin Only)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/organizers/` | Get all organizers | Yes Admin |
| POST | `/organizers/` | Create organizer | Yes Admin |
| PUT | `/organizers/:organizerId` | Edit organizer | Yes Admin |
| PUT | `/organizers/password/:organizerId` | Change organizer password | Yes Admin |
| DELETE | `/organizers/:organizerId` | Delete organizer | Yes Admin |

#### Create/Edit Organizer
**POST** `/organizers/`
```json
{
  "name": "AI Dept",
  "email": "ai@amrita.edu",
  "password": "password123",
  "org_type": "DEPARTMENT",
  "student_head": "Head Name",
  "student_co_head": "CoHeight Name",
  "faculty_head": "Faculty Name"
}
```

#### Change Password
**PUT** `/organizers/password/:organizerId`
```json
{
  "password": "newPassword123"
}
```

### Dashboard

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/organizers/dashboard` | Get organizer's events | Yes Organizer |
| GET | `/organizers/dashboard/:eventId` | Get event participant list | Yes Org/Admin |

---

## Tags

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/tags/` | Fetch all event tags | Yes Admin |
| POST | `/tags/` | Create new tag | Yes Admin |
| PUT | `/tags/:tagId` | Edit tag | Yes Admin |
| DELETE | `/tags/:tagId` | Delete tag | Yes Admin |

#### Create/Edit Tag
**POST** `/tags/`
```json
{
  "name": "Workshop",
  "description": "Learning sessions"
}
```

---

## People

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/people/` | Fetch all people | Yes Admin |
| POST | `/people/` | Add new person | Yes Admin |
| PUT | `/people/:personId` | Update person details | Yes Admin |
| DELETE | `/people/:personId` | Delete person | Yes Admin |

#### Create/Edit Person
**POST** `/people/`
```json
{
  "name": "Speaker Name",
  "description": "Keynote Speaker",
  "image_url": "https://example.com/person.png"
}
```

---

## Attendance

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/attendance/list/event` | Fetch events by organizer | ❌ |
| GET | `/attendance/list/:eventId/:scheduleId` | Fetch participants by event | ❌ |
| POST | `/attendance/solo/mark/:key/:studentId/:scheduleId` | Mark solo check-in/out | ❌ |
| POST | `/attendance/team/mark/:key/:studentId/:scheduleId` | Mark team check-in/out | ❌ |
| DELETE | `/attendance/solo/unMark/:key/:studentId/:scheduleId` | Unmark solo attendance | ❌ |
| DELETE | `/attendance/team/unMark/:key/:studentId/:scheduleId` | Unmark team attendance | ❌ |

---

## Analytics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/analytics/quick` | Quick dashboard stats | Yes Admin |
| GET | `/analytics/revenue` | Revenue analytics | Yes Admin |
| GET | `/analytics/registrations` | Event registration analytics | Yes Admin |
| GET | `/analytics/people` | People analytics | Yes Admin |
| GET | `/analytics/transactions` | Transaction analytics | Yes Admin |

---

## Common Response Formats

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "message": "Error description"
}
```

### Status Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized (Missing/Invalid Token) |
| 403 | Forbidden (CSRF Error / Insufficient Permissions) |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |
