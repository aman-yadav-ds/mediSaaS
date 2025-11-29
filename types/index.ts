export type Role = 'owner' | 'doctor' | 'nurse' | 'receptionist'

export interface Hospital {
    id: string
    name: string
    subscription_status: 'active' | 'past_due' | 'trial'
    created_at: string
}

export interface Department {
    id: string
    hospital_id: string
    name: string
    created_at: string
}

export interface Profile {
    id: string
    email: string
    full_name: string
    hospital_id: string
    role: Role
    department?: string | null
    created_at: string
}

export interface Patient {
    id: string
    hospital_id: string
    full_name: string
    age: number | null
    gender: string | null
    contact_number: string | null
    aadhar_number: string | null
    status: 'waiting_reception' | 'waiting_vitals' | 'waiting_doctor' | 'completed'
    assigned_doctor_id: string | null
    chief_complaint: string | null
    created_at: string
}

export interface Visit {
    id: string
    hospital_id: string
    patient_id: string
    visit_id?: string | null
    recorded_by?: string | null
    blood_pressure?: string | null
    heart_rate?: number | null
    temperature?: number | null
    oxygen_level?: number | null
    visit_date: string
    status: 'waiting_vitals' | 'waiting_doctor' | 'waiting_billing' | 'completed' | 'cancelled'
    payment_status: 'pending' | 'paid' | 'refunded'
    chief_complaint?: string | null
    doctor_id?: string | null
    is_emergency: boolean
    recorded_at: string
}

export interface Medication {
    name: string
    dosage: string
    frequency?: string
    duration?: string
}

export interface Prescription {
    id: string
    hospital_id: string
    patient_id: string
    visit_id?: string | null
    doctor_id?: string | null
    diagnosis?: string | null
    medications: Medication[]
    notes?: string | null
    created_at: string
}

export interface Invoice {
    id: string
    hospital_id: string
    visit_id?: string | null
    patient_id: string
    total_amount: number
    status: 'paid' | 'refunded'
    payment_method: 'cash' | 'card' | 'upi' | 'insurance'
    created_at: string
}

export interface InvoiceItem {
    id: string
    invoice_id: string
    description: string
    quantity: number
    unit_price: number
    total: number
    created_at: string
}

export interface Vital {
    id: string
    visit_id: string
    blood_pressure?: string | null
    heart_rate?: number | null
    temperature?: number | null
    oxygen_level?: number | null
    created_at: string
}