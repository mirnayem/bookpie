CREATE TABLE IF NOT EXISTS warehouse_shelves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (warehouse_id, code)
);

CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    contact_name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'ordered', 'partially_received', 'received', 'cancelled')),
    expected_at DATE,
    subtotal INTEGER NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    note TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
    quantity_ordered INTEGER NOT NULL CHECK (quantity_ordered > 0),
    quantity_received INTEGER NOT NULL DEFAULT 0 CHECK (quantity_received >= 0),
    unit_cost INTEGER NOT NULL CHECK (unit_cost >= 0),
    line_total INTEGER NOT NULL CHECK (line_total >= 0)
);

CREATE TABLE IF NOT EXISTS inventory_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    shelf_id UUID REFERENCES warehouse_shelves(id) ON DELETE SET NULL,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    sku TEXT NOT NULL,
    batch_number TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    received_at DATE NOT NULL DEFAULT CURRENT_DATE,
    expires_at DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (warehouse_id, sku, batch_number)
);

CREATE INDEX IF NOT EXISTS idx_inventory_batches_book_id ON inventory_batches(book_id);
CREATE INDEX IF NOT EXISTS idx_inventory_batches_expires_at ON inventory_batches(expires_at);

CREATE TABLE IF NOT EXISTS inventory_damages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    reason TEXT NOT NULL,
    note TEXT,
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_damages_book_id ON inventory_damages(book_id);

CREATE TABLE IF NOT EXISTS inventory_reconciliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'cancelled')),
    note TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    posted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    posted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_reconciliation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reconciliation_id UUID NOT NULL REFERENCES inventory_reconciliations(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
    expected_quantity INTEGER NOT NULL CHECK (expected_quantity >= 0),
    counted_quantity INTEGER NOT NULL CHECK (counted_quantity >= 0),
    quantity_delta INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cycle_counts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    shelf_id UUID REFERENCES warehouse_shelves(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    scheduled_for DATE NOT NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cycle_count_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_count_id UUID NOT NULL REFERENCES cycle_counts(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
    expected_quantity INTEGER NOT NULL CHECK (expected_quantity >= 0),
    counted_quantity INTEGER CHECK (counted_quantity IS NULL OR counted_quantity >= 0),
    note TEXT
);

INSERT INTO warehouse_shelves (id, warehouse_id, code, name, created_at, updated_at)
VALUES
    ('81000000-0000-0000-0000-000000000001', (SELECT id FROM warehouses WHERE code = 'MAIN'), 'A-01', 'Books Aisle A-01', now(), now()),
    ('81000000-0000-0000-0000-000000000002', (SELECT id FROM warehouses WHERE code = 'MAIN'), 'F-01', 'Food Shelf F-01', now(), now())
ON CONFLICT (warehouse_id, code) DO UPDATE
SET name = EXCLUDED.name,
    updated_at = now();

INSERT INTO suppliers (id, name, slug, contact_name, phone, email, address, created_at, updated_at)
VALUES
    ('82000000-0000-0000-0000-000000000001', 'Somokalin Wholesale', 'somokalin-wholesale', 'Operations Desk', '+8801711111111', 'supply@somokalin.example', 'Banglabazar, Dhaka', now(), now()),
    ('82000000-0000-0000-0000-000000000002', 'Khaas Food Distribution', 'khaas-food-distribution', 'Food Supply', '+8801722222222', 'supply@khaasfood.example', 'Tejgaon, Dhaka', now(), now())
ON CONFLICT (slug) DO UPDATE
SET contact_name = EXCLUDED.contact_name,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    address = EXCLUDED.address,
    updated_at = now();

INSERT INTO purchase_orders (id, supplier_id, warehouse_id, status, expected_at, subtotal, note, created_by, created_at, updated_at)
VALUES (
    '83000000-0000-0000-0000-000000000001',
    '82000000-0000-0000-0000-000000000001',
    (SELECT id FROM warehouses WHERE code = 'MAIN'),
    'ordered',
    CURRENT_DATE + interval '7 days',
    6800,
    'Seed replenishment order for low-stock books.',
    '00000000-0000-0000-0000-000000000003',
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE
SET status = EXCLUDED.status,
    expected_at = EXCLUDED.expected_at,
    subtotal = EXCLUDED.subtotal,
    note = EXCLUDED.note,
    updated_at = now();

INSERT INTO purchase_order_items (id, purchase_order_id, book_id, quantity_ordered, quantity_received, unit_cost, line_total)
VALUES
    ('83100000-0000-0000-0000-000000000001', '83000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 10, 0, 320, 3200),
    ('83100000-0000-0000-0000-000000000002', '83000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000004', 8, 0, 450, 3600)
ON CONFLICT (id) DO UPDATE
SET quantity_ordered = EXCLUDED.quantity_ordered,
    quantity_received = EXCLUDED.quantity_received,
    unit_cost = EXCLUDED.unit_cost,
    line_total = EXCLUDED.line_total;

INSERT INTO inventory_batches (id, warehouse_id, shelf_id, book_id, sku, batch_number, quantity, received_at, expires_at, created_at, updated_at)
VALUES
    ('84000000-0000-0000-0000-000000000001', (SELECT id FROM warehouses WHERE code = 'MAIN'), '81000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'BP-MUSLIMNOGOR', 'BOOK-2026-001', 18, CURRENT_DATE - interval '10 days', NULL, now(), now()),
    ('84000000-0000-0000-0000-000000000002', (SELECT id FROM warehouses WHERE code = 'MAIN'), '81000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000006', 'BP-PREMIUM-HONEY-500GM', 'FOOD-2026-001', 0, CURRENT_DATE - interval '15 days', CURRENT_DATE + interval '180 days', now(), now())
ON CONFLICT (warehouse_id, sku, batch_number) DO UPDATE
SET shelf_id = EXCLUDED.shelf_id,
    quantity = EXCLUDED.quantity,
    received_at = EXCLUDED.received_at,
    expires_at = EXCLUDED.expires_at,
    updated_at = now();

INSERT INTO inventory_damages (id, warehouse_id, book_id, quantity, reason, note, recorded_by, created_at)
VALUES (
    '85000000-0000-0000-0000-000000000001',
    (SELECT id FROM warehouses WHERE code = 'MAIN'),
    '40000000-0000-0000-0000-000000000005',
    1,
    'cover_damage',
    'Seed damaged notebook for damage tracking workflow.',
    '00000000-0000-0000-0000-000000000003',
    now()
)
ON CONFLICT (id) DO UPDATE
SET quantity = EXCLUDED.quantity,
    reason = EXCLUDED.reason,
    note = EXCLUDED.note;

INSERT INTO inventory_reconciliations (id, warehouse_id, status, note, created_by, posted_by, posted_at, created_at, updated_at)
VALUES (
    '86000000-0000-0000-0000-000000000001',
    (SELECT id FROM warehouses WHERE code = 'MAIN'),
    'posted',
    'Seed monthly reconciliation.',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    now(),
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE
SET status = EXCLUDED.status,
    note = EXCLUDED.note,
    posted_by = EXCLUDED.posted_by,
    posted_at = EXCLUDED.posted_at,
    updated_at = now();

INSERT INTO inventory_reconciliation_items (id, reconciliation_id, book_id, expected_quantity, counted_quantity, quantity_delta)
VALUES (
    '86100000-0000-0000-0000-000000000001',
    '86000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000005',
    31,
    30,
    -1
)
ON CONFLICT (id) DO UPDATE
SET expected_quantity = EXCLUDED.expected_quantity,
    counted_quantity = EXCLUDED.counted_quantity,
    quantity_delta = EXCLUDED.quantity_delta;

INSERT INTO cycle_counts (id, warehouse_id, shelf_id, status, scheduled_for, assigned_to, completed_at, created_at, updated_at)
VALUES (
    '87000000-0000-0000-0000-000000000001',
    (SELECT id FROM warehouses WHERE code = 'MAIN'),
    '81000000-0000-0000-0000-000000000001',
    'scheduled',
    CURRENT_DATE + interval '3 days',
    '00000000-0000-0000-0000-000000000003',
    NULL,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE
SET status = EXCLUDED.status,
    scheduled_for = EXCLUDED.scheduled_for,
    assigned_to = EXCLUDED.assigned_to,
    updated_at = now();

INSERT INTO cycle_count_items (id, cycle_count_id, book_id, expected_quantity, counted_quantity, note)
VALUES
    ('87100000-0000-0000-0000-000000000001', '87000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 18, NULL, 'Count on shelf A-01'),
    ('87100000-0000-0000-0000-000000000002', '87000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003', 12, NULL, 'Count on shelf A-01')
ON CONFLICT (id) DO UPDATE
SET expected_quantity = EXCLUDED.expected_quantity,
    counted_quantity = EXCLUDED.counted_quantity,
    note = EXCLUDED.note;
