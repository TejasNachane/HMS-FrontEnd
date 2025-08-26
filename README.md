# 🏥 Hospital Management System - Frontend

A modern, responsive web application for managing hospital operations built with React and Vite. This system provides comprehensive healthcare management solutions for administrators, doctors, and patients.

## 🔗 Related Repositories

- **Backend API**: [Hospital Management System Backend](https://github.com/TejasNachane/Hospital-Management-System)
- **Frontend**: This repository contains the React frontend application

> **Note**: Make sure to clone and run the backend server first before running this frontend application.

## 🌟 Features

### 👥 Role-Based Access Control

- **Admin**: Complete system management and oversight
- **Doctor**: Patient management and appointment handling
- **Patient**: Personal profile and appointment booking

### 🔐 User Management

- **Secure Authentication**: JWT-based login system
- **User Registration**: Separate registration for patients, doctors, and admins
- **Profile Management**: Update personal information and credentials

### 👩‍⚕️ Doctor Management

- **Doctor Registration**: Admin can register new doctors
- **Doctor Profiles**: Detailed information including specializations
- **Doctor Directory**: View all registered doctors
- **Edit Doctor Information**: Update doctor details

### 🏥 Patient Management

- **Patient Registration**: Register new patients in the system
- **Patient Records**: Comprehensive patient information management
- **Patient Directory**: Browse all registered patients
- **Medical History**: Track patient medical records

### 📅 Appointment System

- **Book Appointments**: Schedule appointments with doctors
- **View Appointments**: See all upcoming and past appointments
- **Edit Appointments**: Modify appointment details
- **Appointment Details**: Comprehensive appointment information

### 📊 Dashboard & Analytics

- **Admin Dashboard**: System-wide statistics and management tools
- **Doctor Dashboard**: Patient appointments and schedule overview
- **Patient Dashboard**: Personal appointments and medical information

## 🛠️ Technology Stack

- **Frontend Framework**: React 19.1.0
- **Build Tool**: Vite 7.0.4
- **UI Components**: React Bootstrap 2.10.10
- **Routing**: React Router DOM 7.7.1
- **HTTP Client**: Axios 1.11.0
- **Styling**: Bootstrap 5.3.7
- **Code Quality**: ESLint

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Backend API server running on `http://localhost:8080`

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/TejasNachane/HMS-FrontEnd
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint for code quality checks

## 🏗️ Project Structure

```text
src/
├── components/          # Reusable UI components
│   └── Navigation.jsx   # Main navigation component
├── context/            # React Context providers
│   └── AuthContext.jsx # Authentication state management
├── pages/              # Route-based page components
│   ├── Dashboard.jsx   # Main dashboard
│   ├── Home.jsx        # Landing page
│   ├── Login.jsx       # User authentication
│   ├── Register.jsx    # User registration
│   ├── Patients.jsx    # Patient management
│   ├── Doctors.jsx     # Doctor management
│   ├── Appointments.jsx # Appointment management
│   └── Profile.jsx     # User profile
├── services/           # API integration
│   └── api.js          # Axios configuration and API calls
├── utils/              # Utility components
│   └── ProtectedRoute.jsx # Route protection
├── assets/             # Static assets
└── App.jsx            # Main application component
```

## 🔗 API Integration

The frontend communicates with a backend API server running on `http://localhost:8080/api`. Key API endpoints include:

- **Authentication**: `/auth/login`, `/auth/register/*`
- **Patients**: `/patients/*`
- **Doctors**: `/doctors/*`
- **Appointments**: `/appointments/*`

## 🔒 Authentication & Authorization

### User Roles

- **ADMIN**: Full system access and management capabilities
- **DOCTOR**: Patient and appointment management
- **PATIENT**: Personal profile and appointment booking

### Security Features

- JWT token-based authentication
- Automatic token refresh handling
- Protected routes based on user roles
- Secure localStorage for session persistence




## 🔧 Configuration

### Environment Setup

Make sure your backend API is running on `http://localhost:8080` or update the API base URL in `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```
