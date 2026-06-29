# University Attendance Management System

This project can be moved or renamed. Use the PowerShell scripts in this folder so paths stay relative.

## Start Web System

```powershell
.\START_ALL.ps1
```

Open:

```text
http://localhost:5173
```

## Stop Servers Before Moving Or Renaming

Before moving this folder to Desktop or renaming it, stop running servers:

```powershell
.\STOP_SERVERS.ps1
```

Then move or rename the full project folder normally in File Explorer.

## Start Separately

Backend:

```powershell
.\START_BACKEND.ps1
```

Frontend:

```powershell
.\START_FRONTEND.ps1
```

Mobile:

```powershell
.\START_MOBILE.ps1
```

For Expo Go on a real phone, pass your laptop IP:

```powershell
.\START_MOBILE.ps1 -ApiUrl "http://YOUR_LAPTOP_IP:8082/api"
```

## Database

MySQL is used.

```text
Database: university_attendance_db
User: root
Password: 2004
```

Backend config:

```text
backend/src/main/resources/application.properties
```

Default admin:

```text
antonyjelaksan2004@gmail.com / 2004
```
