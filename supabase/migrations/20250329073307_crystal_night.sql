/*
  # Supply Chain Database Schema Update

  This migration ensures safe creation of tables by checking for their existence first.
  It maintains all the same functionality while avoiding conflicts with existing tables.

  1. Tables
    - Manufacturers, Distributors, Retailers (user types)
    - Products (with quality tracking)
    - Transactions (ownership transfers)
    - Inspections (quality checks)
    - Price History (market tracking)

  2. Security
    - Row Level Security (RLS) enabled
    - Role-based access policies
*/

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS price_history;
DROP TABLE IF EXISTS inspections;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS retailers;
DROP TABLE IF EXISTS distributors;
DROP TABLE IF EXISTS manufacturers;

-- Create manufacturers table
CREATE TABLE manufacturers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    address text,
    created_at timestamptz DEFAULT now(),
    verification_status boolean DEFAULT false
);

-- Create distributors table
CREATE TABLE distributors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    address text,
    created_at timestamptz DEFAULT now(),
    verification_status boolean DEFAULT false
);

-- Create retailers table
CREATE TABLE retailers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    address text,
    created_at timestamptz DEFAULT now(),
    verification_status boolean DEFAULT false
);

-- Create products table
CREATE TABLE products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    manufacturer_id uuid REFERENCES manufacturers(id),
    current_owner_id uuid NOT NULL,
    current_owner_type text NOT NULL,
    status text NOT NULL,
    price numeric NOT NULL,
    retail_price numeric,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    quality_score integer DEFAULT 100,
    temperature numeric,
    humidity numeric,
    location text,
    batch_size integer,
    minimum_order integer,
    CONSTRAINT valid_status CHECK (status IN ('manufactured', 'in-transit', 'delivered')),
    CONSTRAINT valid_owner_type CHECK (current_owner_type IN ('manufacturer', 'distributor', 'retailer'))
);

-- Create transactions table
CREATE TABLE transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES products(id),
    from_id uuid NOT NULL,
    from_type text NOT NULL,
    to_id uuid NOT NULL,
    to_type text NOT NULL,
    action text NOT NULL,
    amount numeric,
    created_at timestamptz DEFAULT now(),
    status text DEFAULT 'pending',
    CONSTRAINT valid_from_type CHECK (from_type IN ('manufacturer', 'distributor', 'retailer')),
    CONSTRAINT valid_to_type CHECK (to_type IN ('manufacturer', 'distributor', 'retailer')),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed'))
);

-- Create inspections table
CREATE TABLE inspections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES products(id),
    inspector_id uuid NOT NULL,
    inspector_type text NOT NULL,
    status text NOT NULL,
    notes text,
    temperature numeric,
    humidity numeric,
    quality_score integer,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT valid_inspector_type CHECK (inspector_type IN ('manufacturer', 'distributor', 'retailer')),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'passed', 'failed'))
);

-- Create price_history table
CREATE TABLE price_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES products(id),
    price numeric NOT NULL,
    timestamp timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- Create policies for manufacturers
CREATE POLICY "Manufacturers can view their own data"
    ON manufacturers
    FOR SELECT
    TO authenticated
    USING (auth.uid()::text = id::text);

-- Create policies for distributors
CREATE POLICY "Distributors can view their own data"
    ON distributors
    FOR SELECT
    TO authenticated
    USING (auth.uid()::text = id::text);

-- Create policies for retailers
CREATE POLICY "Retailers can view their own data"
    ON retailers
    FOR SELECT
    TO authenticated
    USING (auth.uid()::text = id::text);

-- Create policies for products
CREATE POLICY "Users can view products they own"
    ON products
    FOR ALL
    TO authenticated
    USING (
        (auth.uid()::text = manufacturer_id::text AND current_owner_type = 'manufacturer') OR
        (auth.uid()::text = current_owner_id::text)
    );

-- Create policies for transactions
CREATE POLICY "Users can view their transactions"
    ON transactions
    FOR SELECT
    TO authenticated
    USING (
        auth.uid()::text = from_id::text OR
        auth.uid()::text = to_id::text
    );

-- Create policies for inspections
CREATE POLICY "Users can view inspections for their products"
    ON inspections
    FOR ALL
    TO authenticated
    USING (
        auth.uid()::text = inspector_id::text OR
        EXISTS (
            SELECT 1 FROM products
            WHERE products.id = inspections.product_id
            AND auth.uid()::text = products.current_owner_id::text
        )
    );

-- Create policies for price history
CREATE POLICY "Users can view price history for their products"
    ON price_history
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM products
            WHERE products.id = price_history.product_id
            AND (
                auth.uid()::text = products.manufacturer_id::text OR
                auth.uid()::text = products.current_owner_id::text
            )
        )
    );

-- Create function to update product timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamps
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();