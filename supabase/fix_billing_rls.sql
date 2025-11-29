-- Fix RLS for Billing

-- 1. Ensure hospitals table is readable (if RLS is on)
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view hospitals" ON hospitals;
CREATE POLICY "Authenticated users can view hospitals" ON hospitals
    FOR SELECT TO authenticated USING (true);

-- 2. Update Invoices Policy to be sure
DROP POLICY IF EXISTS "Users can view invoices from their hospital" ON invoices;
CREATE POLICY "Users can view invoices from their hospital" ON invoices
    FOR SELECT TO authenticated USING (
        hospital_id IN (
            SELECT hospital_id FROM profiles WHERE id = auth.uid()
        )
    );

-- 3. Update Invoice Items Policy
DROP POLICY IF EXISTS "Users can view invoice items from their hospital" ON invoice_items;
CREATE POLICY "Users can view invoice items from their hospital" ON invoice_items
    FOR SELECT TO authenticated USING (
        invoice_id IN (
            SELECT id FROM invoices WHERE hospital_id IN (
                SELECT hospital_id FROM profiles WHERE id = auth.uid()
            )
        )
    );
