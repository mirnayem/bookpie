ALTER TABLE categories
    ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE books
    ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS barcode TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS gallery_image_urls TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS seo_title TEXT,
    ADD COLUMN IF NOT EXISTS seo_description TEXT,
    ADD COLUMN IF NOT EXISTS warehouse_price INTEGER CHECK (warehouse_price IS NULL OR warehouse_price >= 0),
    ADD COLUMN IF NOT EXISTS dynamic_pricing_enabled BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_books_brand_id ON books(brand_id);
CREATE INDEX IF NOT EXISTS idx_books_sku ON books(sku);
CREATE INDEX IF NOT EXISTS idx_books_tags ON books USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_books_specifications ON books USING GIN(specifications);
CREATE INDEX IF NOT EXISTS idx_books_attributes ON books USING GIN(attributes);

CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    sku TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
    price INTEGER NOT NULL CHECK (price >= 0),
    sale_price INTEGER NOT NULL CHECK (sale_price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (sale_price <= price)
);

CREATE INDEX IF NOT EXISTS idx_product_variants_book_id ON product_variants(book_id);

CREATE TABLE IF NOT EXISTS product_pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    discount_percent INTEGER CHECK (discount_percent IS NULL OR discount_percent BETWEEN 0 AND 100),
    fixed_sale_price INTEGER CHECK (fixed_sale_price IS NULL OR fixed_sale_price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (discount_percent IS NOT NULL OR fixed_sale_price IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_product_pricing_rules_book_id ON product_pricing_rules(book_id);
CREATE INDEX IF NOT EXISTS idx_product_pricing_rules_active ON product_pricing_rules(is_active);

INSERT INTO brands (id, name, slug, logo_url, created_at, updated_at)
VALUES
    ('21000000-0000-0000-0000-000000000001', 'BookPie Books', 'bookpie-books', 'https://placehold.co/240x120/4f46e5/ffffff?text=BookPie', now(), now()),
    ('21000000-0000-0000-0000-000000000002', 'Khaas Food', 'khaas-food-brand', 'https://placehold.co/240x120/0f766e/ffffff?text=Khaas+Food', now(), now()),
    ('21000000-0000-0000-0000-000000000003', 'BookPie Stationery', 'bookpie-stationery-brand', 'https://placehold.co/240x120/7c3aed/ffffff?text=Stationery', now(), now())
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    logo_url = EXCLUDED.logo_url,
    updated_at = now();

UPDATE categories
SET image_url = CASE slug
    WHEN 'islamic-books' THEN 'https://placehold.co/320x180/4f46e5/ffffff?text=Islamic+Books'
    WHEN 'history-and-tradition' THEN 'https://placehold.co/320x180/312e81/ffffff?text=History'
    WHEN 'kids-books' THEN 'https://placehold.co/320x180/0f766e/ffffff?text=Kids'
    WHEN 'stationery' THEN 'https://placehold.co/320x180/7c3aed/ffffff?text=Stationery'
    WHEN 'food' THEN 'https://placehold.co/320x180/b45309/ffffff?text=Food'
    ELSE image_url
END,
updated_at = now()
WHERE slug IN ('islamic-books', 'history-and-tradition', 'kids-books', 'stationery', 'food');

UPDATE books
SET
    brand_id = CASE
        WHEN publisher_id = '20000000-0000-0000-0000-000000000005' THEN '21000000-0000-0000-0000-000000000002'::uuid
        WHEN publisher_id = '20000000-0000-0000-0000-000000000004' THEN '21000000-0000-0000-0000-000000000003'::uuid
        ELSE '21000000-0000-0000-0000-000000000001'::uuid
    END,
    sku = COALESCE(sku, 'BP-' || upper(replace(slug, '-', '-'))),
    barcode = COALESCE(barcode, '880' || right(replace(id::text, '-', ''), 10)),
    gallery_image_urls = CASE
        WHEN cardinality(gallery_image_urls) = 0 AND cover_image_url IS NOT NULL THEN ARRAY[cover_image_url]
        ELSE gallery_image_urls
    END,
    tags = CASE
        WHEN cardinality(tags) = 0 THEN ARRAY['featured', 'seeded']
        ELSE tags
    END,
    specifications = CASE
        WHEN specifications = '{}'::jsonb THEN jsonb_build_object('language', 'Bangla', 'binding', 'Paperback')
        ELSE specifications
    END,
    attributes = CASE
        WHEN attributes = '{}'::jsonb THEN jsonb_build_object('source', 'seed', 'format', 'physical')
        ELSE attributes
    END,
    seo_title = COALESCE(seo_title, title || ' | BookPie'),
    seo_description = COALESCE(seo_description, left(COALESCE(description, title), 155)),
    warehouse_price = COALESCE(warehouse_price, GREATEST(sale_price - 40, 0)),
    dynamic_pricing_enabled = COALESCE(dynamic_pricing_enabled, false),
    updated_at = now()
WHERE slug IN ('muslimnogor', 'attoshuddhi', 'hukkashi-somogro', 'great-expectations', 'biology-notebook', 'premium-honey-500gm');

INSERT INTO product_variants (id, book_id, sku, title, attributes, price, sale_price, stock, is_active, created_at, updated_at)
VALUES
    ('41000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'BP-MUSLIMNOGOR-PAPERBACK', 'Paperback', '{"binding":"Paperback"}', 480, 380, 18, true, now(), now()),
    ('41000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000004', 'BP-GREAT-EXPECTATIONS-PAPERBACK', 'Paperback', '{"binding":"Paperback"}', 650, 520, 7, true, now(), now())
ON CONFLICT (sku) DO UPDATE
SET title = EXCLUDED.title,
    attributes = EXCLUDED.attributes,
    price = EXCLUDED.price,
    sale_price = EXCLUDED.sale_price,
    stock = EXCLUDED.stock,
    is_active = EXCLUDED.is_active,
    updated_at = now();

INSERT INTO product_pricing_rules (id, book_id, name, starts_at, ends_at, discount_percent, fixed_sale_price, is_active, created_at, updated_at)
VALUES
    ('42000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Launch discount', now() - interval '1 day', now() + interval '30 days', 20, NULL, true, now(), now()),
    ('42000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000006', 'Food catalog fixed sale', now() - interval '1 day', now() + interval '30 days', NULL, 650, true, now(), now())
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    starts_at = EXCLUDED.starts_at,
    ends_at = EXCLUDED.ends_at,
    discount_percent = EXCLUDED.discount_percent,
    fixed_sale_price = EXCLUDED.fixed_sale_price,
    is_active = EXCLUDED.is_active,
    updated_at = now();
