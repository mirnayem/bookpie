-- Demo data for local development and admin dashboard QA.
-- Login password for all seeded users: password123

INSERT INTO users (id, name, email, password_hash, role, phone, email_verified_at, phone_verified_at, is_active, created_at, updated_at)
VALUES
    (
        '00000000-0000-0000-0000-000000000001',
        'BookPie Super Admin',
        'admin@bookpie.local',
        '$argon2id$v=19$m=19456,t=2,p=1$SxBNtB3Yi+mVNWUQd15fYA$2FTPnZ9QfQZNP821+HaGc5g85KsmLV/DOdlM9nHV0Po',
        'super_admin',
        '+8801700000001',
        now(),
        now(),
        true,
        now(),
        now()
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'BookPie Customer',
        'customer@bookpie.local',
        '$argon2id$v=19$m=19456,t=2,p=1$SxBNtB3Yi+mVNWUQd15fYA$2FTPnZ9QfQZNP821+HaGc5g85KsmLV/DOdlM9nHV0Po',
        'customer',
        '+8801700000002',
        now(),
        now(),
        true,
        now(),
        now()
    ),
    (
        '00000000-0000-0000-0000-000000000003',
        'Warehouse Manager',
        'warehouse@bookpie.local',
        '$argon2id$v=19$m=19456,t=2,p=1$SxBNtB3Yi+mVNWUQd15fYA$2FTPnZ9QfQZNP821+HaGc5g85KsmLV/DOdlM9nHV0Po',
        'warehouse_manager',
        '+8801700000003',
        now(),
        now(),
        true,
        now(),
        now()
    ),
    (
        '00000000-0000-0000-0000-000000000004',
        'Delivery Agent',
        'delivery@bookpie.local',
        '$argon2id$v=19$m=19456,t=2,p=1$SxBNtB3Yi+mVNWUQd15fYA$2FTPnZ9QfQZNP821+HaGc5g85KsmLV/DOdlM9nHV0Po',
        'delivery_agent',
        '+8801700000004',
        now(),
        now(),
        true,
        now(),
        now()
    )
ON CONFLICT (email) DO UPDATE
SET
    name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    email_verified_at = EXCLUDED.email_verified_at,
    phone_verified_at = EXCLUDED.phone_verified_at,
    is_active = EXCLUDED.is_active,
    updated_at = now();

INSERT INTO customer_profiles (user_id, display_name, phone, date_of_birth, created_at, updated_at)
VALUES
    ('00000000-0000-0000-0000-000000000002', 'BookPie Customer', '+8801700000002', '1994-03-14', now(), now()),
    ('00000000-0000-0000-0000-000000000001', 'BookPie Super Admin', '+8801700000001', NULL, now(), now())
ON CONFLICT (user_id) DO UPDATE
SET
    display_name = EXCLUDED.display_name,
    phone = EXCLUDED.phone,
    date_of_birth = EXCLUDED.date_of_birth,
    updated_at = now();

INSERT INTO customer_addresses (id, user_id, label, recipient_name, phone, address_line1, address_line2, city, zone, postal_code, latitude, longitude, is_default, created_at, updated_at)
VALUES
    (
        '60000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002',
        'Home',
        'BookPie Customer',
        '+8801700000002',
        'House 12, Road 5, Dhanmondi',
        'Near Lake Circus',
        'Dhaka',
        'Dhanmondi',
        '1209',
        23.7461,
        90.3742,
        true,
        now(),
        now()
    ),
    (
        '60000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000002',
        'Office',
        'BookPie Customer',
        '+8801700000002',
        'Level 4, Software Technology Park',
        'Kawran Bazar',
        'Dhaka',
        'Tejgaon',
        '1215',
        23.7515,
        90.3935,
        false,
        now(),
        now()
    )
ON CONFLICT (id) DO UPDATE
SET
    label = EXCLUDED.label,
    recipient_name = EXCLUDED.recipient_name,
    phone = EXCLUDED.phone,
    address_line1 = EXCLUDED.address_line1,
    address_line2 = EXCLUDED.address_line2,
    city = EXCLUDED.city,
    zone = EXCLUDED.zone,
    postal_code = EXCLUDED.postal_code,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    is_default = EXCLUDED.is_default,
    updated_at = now();

INSERT INTO authors (id, name, slug, created_at, updated_at)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'আরিফ আজাদ', 'arif-azad', now(), now()),
    ('10000000-0000-0000-0000-000000000002', 'হুমায়ূন আহমেদ', 'humayun-ahmed', now(), now()),
    ('10000000-0000-0000-0000-000000000003', 'Dr. Nasir Misfir Al Zahrani', 'dr-nasir-misfir-al-zahrani', now(), now()),
    ('10000000-0000-0000-0000-000000000004', 'Charles Dickens', 'charles-dickens', now(), now()),
    ('10000000-0000-0000-0000-000000000005', 'মাওলানা মুহাম্মাদ আবদুর রহীম', 'mawlana-muhammad-abdur-rahim', now(), now())
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, updated_at = now();

INSERT INTO publishers (id, name, slug, created_at, updated_at)
VALUES
    ('20000000-0000-0000-0000-000000000001', 'সমকালীন প্রকাশন', 'somokalin-prokashon', now(), now()),
    ('20000000-0000-0000-0000-000000000002', 'Ruhaama Publication', 'ruhaama-publication', now(), now()),
    ('20000000-0000-0000-0000-000000000003', 'Penguin Classics', 'penguin-classics', now(), now()),
    ('20000000-0000-0000-0000-000000000004', 'BookPie Stationery', 'bookpie-stationery', now(), now()),
    ('20000000-0000-0000-0000-000000000005', 'Khaas Food', 'khaas-food', now(), now())
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, updated_at = now();

INSERT INTO categories (id, name, slug, created_at, updated_at)
VALUES
    ('30000000-0000-0000-0000-000000000001', 'ইসলামী বই', 'islamic-books', now(), now()),
    ('30000000-0000-0000-0000-000000000002', 'ইতিহাস ও ঐতিহ্য', 'history-and-tradition', now(), now()),
    ('30000000-0000-0000-0000-000000000003', 'শিশু-কিশোর বই', 'kids-books', now(), now()),
    ('30000000-0000-0000-0000-000000000004', 'স্টেশনারী', 'stationery', now(), now()),
    ('30000000-0000-0000-0000-000000000005', 'ফুড', 'food', now(), now()),
    ('30000000-0000-0000-0000-000000000006', 'ক্লাসিক সাহিত্য', 'classic-literature', now(), now())
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, updated_at = now();

INSERT INTO books (id, title, slug, description, author_id, publisher_id, price, sale_price, stock, cover_image_url, created_at, updated_at)
VALUES
    (
        '40000000-0000-0000-0000-000000000001',
        'মুসলিমনগর',
        'muslimnogor',
        'ইসলামী অর্থব্যবস্থা, শাসনব্যবস্থা ও রাজনীতি নিয়ে সমকালীন পাঠকদের জন্য নির্বাচিত বই।',
        '10000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        480,
        380,
        18,
        'https://placehold.co/320x480/4f46e5/ffffff?text=Muslimnogor',
        now(),
        now()
    ),
    (
        '40000000-0000-0000-0000-000000000002',
        'আত্মশুদ্ধি',
        'attoshuddhi',
        'আত্মগঠন, নৈতিকতা এবং ব্যক্তিগত উন্নয়ন বিষয়ে সহজপাঠ্য বই।',
        '10000000-0000-0000-0000-000000000003',
        '20000000-0000-0000-0000-000000000002',
        500,
        400,
        5,
        'https://placehold.co/320x480/7c3aed/ffffff?text=Attoshuddhi',
        now(),
        now()
    ),
    (
        '40000000-0000-0000-0000-000000000003',
        'হুক্কাশি সমগ্র',
        'hukkashi-somogro',
        'জনপ্রিয় গোয়েন্দা গল্পের সংকলন।',
        '10000000-0000-0000-0000-000000000002',
        '20000000-0000-0000-0000-000000000001',
        700,
        490,
        12,
        'https://placehold.co/320x480/312e81/ffffff?text=Hukkashi',
        now(),
        now()
    ),
    (
        '40000000-0000-0000-0000-000000000004',
        'Great Expectations',
        'great-expectations',
        'A classic novel by Charles Dickens for literature readers.',
        '10000000-0000-0000-0000-000000000004',
        '20000000-0000-0000-0000-000000000003',
        650,
        520,
        7,
        'https://placehold.co/320x480/4338ca/ffffff?text=Great+Expectations',
        now(),
        now()
    ),
    (
        '40000000-0000-0000-0000-000000000005',
        'Biology Notebook',
        'biology-notebook',
        'School notebook for biology notes and diagrams.',
        '10000000-0000-0000-0000-000000000005',
        '20000000-0000-0000-0000-000000000004',
        400,
        375,
        30,
        'https://placehold.co/320x480/0f766e/ffffff?text=Biology+Notebook',
        now(),
        now()
    ),
    (
        '40000000-0000-0000-0000-000000000006',
        'Premium Honey 500gm',
        'premium-honey-500gm',
        'Natural honey product for the food catalog.',
        '10000000-0000-0000-0000-000000000005',
        '20000000-0000-0000-0000-000000000005',
        700,
        650,
        0,
        'https://placehold.co/320x480/b45309/ffffff?text=Honey',
        now(),
        now()
    )
ON CONFLICT (slug) DO UPDATE
SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    author_id = EXCLUDED.author_id,
    publisher_id = EXCLUDED.publisher_id,
    price = EXCLUDED.price,
    sale_price = EXCLUDED.sale_price,
    stock = EXCLUDED.stock,
    cover_image_url = EXCLUDED.cover_image_url,
    updated_at = now();

INSERT INTO book_categories (book_id, category_id)
VALUES
    ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001'),
    ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002'),
    ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001'),
    ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003'),
    ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000006'),
    ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000004'),
    ('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000005')
ON CONFLICT (book_id, category_id) DO NOTHING;

INSERT INTO carts (id, user_id, created_at, updated_at)
VALUES ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', now(), now())
ON CONFLICT (user_id) DO UPDATE
SET updated_at = now();

INSERT INTO cart_items (cart_id, book_id, quantity, created_at, updated_at)
VALUES
    ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000004', 1, now(), now()),
    ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000006', 2, now(), now())
ON CONFLICT (cart_id, book_id) DO UPDATE
SET quantity = EXCLUDED.quantity, updated_at = now();

INSERT INTO stock_movements (id, warehouse_id, book_id, quantity_delta, reason, note, created_by, created_at)
VALUES
    ('80000000-0000-0000-0000-000000000001', (SELECT id FROM warehouses WHERE code = 'MAIN'), '40000000-0000-0000-0000-000000000001', 18, 'initial_stock', 'Seed opening balance', '00000000-0000-0000-0000-000000000003', now()),
    ('80000000-0000-0000-0000-000000000002', (SELECT id FROM warehouses WHERE code = 'MAIN'), '40000000-0000-0000-0000-000000000002', 5, 'initial_stock', 'Seed low-stock sample', '00000000-0000-0000-0000-000000000003', now()),
    ('80000000-0000-0000-0000-000000000003', (SELECT id FROM warehouses WHERE code = 'MAIN'), '40000000-0000-0000-0000-000000000003', 12, 'initial_stock', 'Seed opening balance', '00000000-0000-0000-0000-000000000003', now()),
    ('80000000-0000-0000-0000-000000000004', (SELECT id FROM warehouses WHERE code = 'MAIN'), '40000000-0000-0000-0000-000000000004', 7, 'initial_stock', 'Seed opening balance', '00000000-0000-0000-0000-000000000003', now()),
    ('80000000-0000-0000-0000-000000000005', (SELECT id FROM warehouses WHERE code = 'MAIN'), '40000000-0000-0000-0000-000000000005', 30, 'initial_stock', 'Seed opening balance', '00000000-0000-0000-0000-000000000003', now()),
    ('80000000-0000-0000-0000-000000000006', (SELECT id FROM warehouses WHERE code = 'MAIN'), '40000000-0000-0000-0000-000000000006', 0, 'initial_stock', 'Seed out-of-stock sample', '00000000-0000-0000-0000-000000000003', now()),
    ('80000000-0000-0000-0000-000000000007', (SELECT id FROM warehouses WHERE code = 'MAIN'), '40000000-0000-0000-0000-000000000001', -1, 'order_reserved', 'Reserved for confirmed demo order', '00000000-0000-0000-0000-000000000003', now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO orders (id, user_id, address_id, status, payment_provider, payment_status, subtotal, shipping_fee, discount_total, total, created_at, updated_at)
VALUES
    (
        '70000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002',
        '60000000-0000-0000-0000-000000000001',
        'confirmed',
        'bkash',
        'paid',
        780,
        80,
        0,
        860,
        now() - interval '2 days',
        now()
    ),
    (
        '70000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000002',
        '60000000-0000-0000-0000-000000000002',
        'pending',
        'sslcommerz',
        'pending',
        490,
        80,
        0,
        570,
        now() - interval '1 day',
        now()
    )
ON CONFLICT (id) DO UPDATE
SET
    status = EXCLUDED.status,
    payment_provider = EXCLUDED.payment_provider,
    payment_status = EXCLUDED.payment_status,
    subtotal = EXCLUDED.subtotal,
    shipping_fee = EXCLUDED.shipping_fee,
    discount_total = EXCLUDED.discount_total,
    total = EXCLUDED.total,
    updated_at = now();

INSERT INTO order_items (id, order_id, book_id, title, quantity, unit_price, line_total)
VALUES
    ('71000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'মুসলিমনগর', 1, 380, 380),
    ('71000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 'আত্মশুদ্ধি', 1, 400, 400),
    ('71000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000003', 'হুক্কাশি সমগ্র', 1, 490, 490)
ON CONFLICT (id) DO UPDATE
SET
    title = EXCLUDED.title,
    quantity = EXCLUDED.quantity,
    unit_price = EXCLUDED.unit_price,
    line_total = EXCLUDED.line_total;

INSERT INTO order_timeline (id, order_id, status, note, created_by, created_at)
VALUES
    ('72000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'pending', 'Order created from seeded checkout flow.', '00000000-0000-0000-0000-000000000002', now() - interval '2 days'),
    ('72000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000001', 'confirmed', 'Payment received by bKash mock flow.', '00000000-0000-0000-0000-000000000001', now() - interval '1 day 20 hours'),
    ('72000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000002', 'pending', 'Awaiting SSLCommerz payment verification.', '00000000-0000-0000-0000-000000000002', now() - interval '1 day')
ON CONFLICT (id) DO UPDATE
SET
    status = EXCLUDED.status,
    note = EXCLUDED.note,
    created_by = EXCLUDED.created_by;

INSERT INTO delivery_assignments (id, order_id, agent_name, agent_phone, status, note, assigned_by, created_at, updated_at)
VALUES
    (
        '73000000-0000-0000-0000-000000000001',
        '70000000-0000-0000-0000-000000000001',
        'Delivery Agent',
        '+8801700000004',
        'assigned',
        'Manual delivery assignment for seeded paid order.',
        '00000000-0000-0000-0000-000000000001',
        now() - interval '1 day 18 hours',
        now()
    )
ON CONFLICT (order_id) DO UPDATE
SET
    agent_name = EXCLUDED.agent_name,
    agent_phone = EXCLUDED.agent_phone,
    status = EXCLUDED.status,
    note = EXCLUDED.note,
    assigned_by = EXCLUDED.assigned_by,
    updated_at = now();
