import { z } from "zod"

export const patientSchema = z.object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    age: z.coerce.number().min(0).max(120),
    gender: z.enum(["male", "female", "other"]),
    contact_number: z.string().min(10, "Contact number must be at least 10 digits"),
    aadhar_number: z.string().length(12, "Aadhar number must be 12 digits"),
    chief_complaint: z.string().optional(),
})

export type PatientInput = z.infer<typeof patientSchema>
