# Java Backend - University Attendance Management System

This backend uses Java Spring Boot with MySQL.
Database name: `university_attendance_db`.

## Run Commands

```powershell
cd backend
mvn spring-boot:run
```

## Base URL

```text
http://localhost:8082/api
```

## MySQL Setup

Run this in MySQL Workbench, phpMyAdmin, or MySQL terminal:

```sql
CREATE DATABASE IF NOT EXISTS university_attendance_db;
```

Database config is in `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/university_attendance_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=
```

If your MySQL root has a password, add it after `spring.datasource.password=`.

## Email OTP Setup

Open `src/main/resources/application.properties` and set:

```properties
spring.mail.username=yourgmail@gmail.com
spring.mail.password=your_gmail_app_password
app.mail.from=yourgmail@gmail.com
```

Use a Gmail App Password, not the normal Gmail password.

After changing mail settings, restart:

```powershell
mvn spring-boot:run
```

## Important APIs

```text
POST   /api/auth/login
POST   /api/auth/forgot-password
POST   /api/auth/verify-otp
POST   /api/auth/reset-password
GET    /api/users
POST   /api/users
GET    /api/students
POST   /api/students
GET    /api/batches
POST   /api/batches
GET    /api/attendance
POST   /api/attendance
GET    /api/timetable
POST   /api/timetable
GET    /api/campus
POST   /api/campus
GET    /api/reports/dashboard
GET    /api/reports/deleted-records
```

## Login JSON

```json
{
  "email": "antonyjelaksan2004@gmail.com",
  "password": "2004"
}
```

## Attendance JSON

```json
{
  "batchId": 1,
  "studentId": 1,
  "teacherId": 3,
  "date": "2026-06-18",
  "session": "morning",
  "status": "PRESENT"
}
```
