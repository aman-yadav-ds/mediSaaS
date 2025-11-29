-- Add payment_status to visits
ALTER TABLE visits 
ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled'));

-- Create invoices table
CREATE TABLE invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    hospital_id UUID REFERENCES hospitals(id) NOT NULL,
    visit_id UUID REFERENCES visits(id) NOT NULL,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT DEFAULT 'paid' CHECK (status IN ('paid', 'refunded')),
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'upi', 'insurance'))
);

-- Create invoice items table
CREATE TABLE invoice_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL
);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
CREATE POLICY "Users can view invoices from their hospital" ON invoices
    FOR SELECT USING (
        hospital_id IN (
            SELECT hospital_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert invoices for their hospital" ON invoices
    FOR INSERT WITH CHECK (
        hospital_id IN (
            SELECT hospital_id FROM profiles WHERE id = auth.uid()
        )
    );

-- RLS Policies for invoice_items
CREATE POLICY "Users can view invoice items from their hospital" ON invoice_items
    FOR SELECT USING (
        invoice_id IN (
            SELECT id FROM invoices WHERE hospital_id IN (
                SELECT hospital_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert invoice items for their hospital" ON invoice_items
    FOR INSERT WITH CHECK (
        invoice_id IN (
            SELECT id FROM invoices WHERE hospital_id IN (
                SELECT hospital_id FROM profiles WHERE id = auth.uid()
            )
        )
    );
