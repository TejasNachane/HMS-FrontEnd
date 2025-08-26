import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  registerAdmin: (adminData) => api.post('/auth/register/admin', adminData),
  registerDoctor: (doctorData) => api.post('/auth/register/doctor', doctorData),
  registerPatient: (patientData) => api.post('/auth/register/patient', patientData),
};

// Doctor API
export const doctorAPI = {
  getAllDoctors: () => api.get('/doctors'),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  updateDoctor: (id, doctorData) => api.put(`/doctors/${id}`, doctorData),
  deleteDoctor: (id) => api.delete(`/doctors/${id}`),
  searchDoctors: (specialization) => api.get(`/doctors/search?specialization=${specialization}`),
};

// Patient API
export const patientAPI = {
  getAllPatients: () => api.get('/patients'),
  getPatientById: (id) => api.get(`/patients/${id}`),
  updatePatient: (id, patientData) => api.put(`/patients/${id}`, patientData),
  deletePatient: (id) => api.delete(`/patients/${id}`),
  searchPatients: (name) => api.get(`/patients/search?name=${name}`),
};

// Appointment API
export const appointmentAPI = {
  getAllAppointments: () => api.get('/appointments'),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  createAppointment: (appointmentData) => api.post('/appointments', appointmentData),
  updateAppointment: (id, appointmentData) => api.put(`/appointments/${id}`, appointmentData),
  updateAppointmentStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }),
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),
  getAppointmentsByDoctor: (doctorId) => api.get(`/appointments/doctor/${doctorId}`),
  getAppointmentsByPatient: (patientId) => api.get(`/appointments/patient/${patientId}`),
  getAppointmentsByStatus: (status) => api.get(`/appointments/status/${status}`),
};

// Prescription API
export const prescriptionAPI = {
  getAllPrescriptions: () => api.get('/prescriptions'),
  getPrescriptionById: (id) => api.get(`/prescriptions/${id}`),
  createPrescription: (prescriptionData) => api.post('/prescriptions', prescriptionData),
  updatePrescription: (id, prescriptionData) => api.put(`/prescriptions/${id}`, prescriptionData),
  deletePrescription: (id) => api.delete(`/prescriptions/${id}`),
  getPrescriptionsByDoctor: (doctorId) => api.get(`/prescriptions/doctor/${doctorId}`),
  getPrescriptionsByPatient: (patientId) => api.get(`/prescriptions/patient/${patientId}`),
};

export default api;
