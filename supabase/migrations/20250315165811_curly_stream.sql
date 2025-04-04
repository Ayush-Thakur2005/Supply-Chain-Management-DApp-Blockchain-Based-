/*
  # Supply Chain Database Schema

  1. New Tables
    - `manufacturers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `address` (text)
      - `created_at` (timestamp)
      - `verification_status` (boolean)
      - `otp_secret` (text)
      - `otp_valid_until` (timestamp)

    - `distributors`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `address` (text)
      - `created_at` (timestamp)
      - `verification_status` (boolean)
      - `otp_secret` (text)
      - `otp_valid_until` (timestamp)

    - `retailers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `address` (text)
      - `created_at` (timestamp)
      - `verification_status` (boolean)
      - `otp_secret` (text)
      - `otp_valid_until` (timestamp)

    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `manufacturer_id` (uuid, references manufacturers)
      - `current_owner_id` (uuid)
      - `current_owner_type` (text)
      - `status` (text)
      - `price` (numeric)
      - `retail_price` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `quality_score` (integer)
      - `temperature` (numeric)
      - `humidity` (numeric)
      - `location` (text)
      - `batch_size` (integer)
      - `minimum_order` (integer)

    - `transactions`
      - `id` (uuid, primary key)
      - `product_id` (uuid, references products)
      - `from_id` (uuid)
      - `from_type` (text)
      - `to_id` (uuid)
      - `to_type` (text)
      - `action` (text)
      - `amount` (numeric)
      - `created_at` (timestamp)
      - `status` (text)

    - `inspections`
      - `id` (uuid, primary key)
      - `product_id` (uuid, references products)
      - `inspector_id` (uuid)
      - `inspector_type` (text)
      - `status` (text)
      - `notes` (text)
      - `temperature` (numeric)
      - `humidity` (numeric)
      - `quality_score` (integer)
      - `created_at` (timestamp)

    - `price_history`
      - `id` (uuid, primary key)
      - `product_id` (uuid, references products)
      - `price` (numeric)
      - `timestamp` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create manufacturers table
CREATE TABLE manufacturers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    address text,
    created_at timestamptz DEFAULT now(),
    verification_status boolean DEFAULT false,
    otp_secret text,
    otp_valid_until timestamptz
);

-- Create distributors table
CREATE TABLE distributors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    address text,
    created_at timestamptz DEFAULT now(),
    verification_status boolean DEFAULT false,
    otp_secret text,
    otp_valid_until timestamptz
);

-- Create retailers table
CREATE TABLE retailers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    address text,
    created_at timestamptz DEFAULT now(),
    verification_status boolean DEFAULT false,
    otp_secret text,
    otp_valid_until timestamptz
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
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();