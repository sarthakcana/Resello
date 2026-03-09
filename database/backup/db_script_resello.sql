BEGIN;
	CREATE TABLE enum_master(
		id BIGSERIAL PRIMARY KEY,
		master_name VARCHAR(50) NOT NULL,
		option_name VARCHAR(50) NOT NULL,
		sort_index INT NOT NULL DEFAULT 1,
		is_active BOOLEAN DEFAULT TRUE,
		UNIQUE(master_name, option_name)
	);
	CREATE TABLE users (
		id BIGSERIAL PRIMARY KEY,
		email TEXT NOT NULL UNIQUE,
		phone VARCHAR(15),
		password TEXT NOT NULL DEFAULT 'system',
		status INT NOT NULL DEFAULT 1 REFERENCES enum_master(id),   -- user_status | active suspended deleted
		is_verified BOOLEAN DEFAULT FALSE,
		created_at TIMESTAMP DEFAULT NOW(),
		updated_at TIMESTAMP DEFAULT NOW()
	);
	CREATE TABLE user_profile(
		user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
		first_name VARCHAR(50),
		last_name VARCHAR(50),
		avatar_url TEXT,
		created_at TIMESTAMP DEFAULT NOW(),
		updated_at TIMESTAMP DEFAULT NOW()
	);
	CREATE TABLE roles(
		id SERIAL PRIMARY KEY,
		name VARCHAR(50) NOT NULL UNIQUE,
		description TEXT,
		is_system BOOLEAN DEFAULT FALSE
	);
	
	CREATE TABLE user_roles(
		user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
		role_id INT REFERENCES roles(id) ON DELETE CASCADE,
		PRIMARY KEY (user_id,role_id)
	);
	
	CREATE TABLE refresh_tokens(
		id BIGSERIAL PRIMARY KEY,
		user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		token TEXT NOT NULL,
		expires_at TIMESTAMP NOT NULL,
		created_at TIMESTAMP DEFAULT NOW()
	);
	
	CREATE TABLE addresses
	(
	    id BIGSERIAL PRIMARY KEY,
	    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
	    name VARCHAR(50),
	    phone VARCHAR(15),
	    line1 TEXT NOT NULL,
	    line2 TEXT,
	    city VARCHAR(50),
	    state VARCHAR(50),
	    pincode VARCHAR(10),
	    country VARCHAR(50),
	    is_default boolean DEFAULT FALSE,
	    created_at TIMESTAMP DEFAULT now(),
	    updated_at  TIMESTAMP DEFAULT now()
		-- UNIQUE (user_id) WHERE is_default = TRUE
	);
	
	-- NEW TABLES
	
	CREATE TABLE brands(
		id BIGSERIAL PRIMARY KEY,
		name VARCHAR(50) NOT NULL,
		slug VARCHAR(50) NOT NULL UNIQUE,
		status INT DEFAULT 1 REFERENCES enum_master(id)    -- brand_model_status | active inactive deprecated
	);
	CREATE TABLE categories(
		id BIGSERIAL PRIMARY KEY,
		name VARCHAR(50) NOT NULL,
		parent_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
		slug VARCHAR(100) UNIQUE,
		sort_index INT NOT NULL DEFAULT 1,
		is_active BOOLEAN DEFAULT TRUE
	);
	CREATE TABLE model_series(
		id BIGSERIAL PRIMARY KEY,
		brand_id BIGINT NOT NULL REFERENCES brands(id),
		name VARCHAR(50) NOT NULL,
		slug VARCHAR(100) NOT NULL,
		status INT NOT NULL DEFAULT 1 REFERENCES enum_master(id),     -- brand_model_status | active inactive deprecated
		UNIQUE (brand_id, name)
	);
	CREATE TABLE models(
		id BIGSERIAL PRIMARY KEY,
		brand_id BIGINT REFERENCES brands(id) ON DELETE RESTRICT,
		series_id BIGINT REFERENCES model_series(id) ON DELETE SET NULL,
		category_id BIGINT REFERENCES categories(id) ON DELETE RESTRICT,
		name VARCHAR(50) NOT NULL,
		slug VARCHAR(100) NOT NULL,
		status INT DEFAULT 1 REFERENCES enum_master(id),    -- brand_model_status | active inactive deprecated
		UNIQUE (brand_id, category_id, name)
	);
	
	CREATE TABLE product_master(
		id BIGSERIAL PRIMARY KEY,
		name VARCHAR(100) NOT NULL,
		model_id BIGINT NOT NULL REFERENCES models(id),
		description TEXT,
		vendor VARCHAR,
		slug VARCHAR(100) UNIQUE,
		status INT NOT NULL DEFAULT 1 REFERENCES enum_master(id), -- product_status | active inactive deleted
		created_at TIMESTAMP DEFAULT NOW(),
		updated_at TIMESTAMP DEFAULT NOW()
	);
	CREATE TABLE services(
		id BIGSERIAL PRIMARY KEY,
		name VARCHAR(50) NOT NULL,
		slug VARCHAR(100) NOT NULL UNIQUE,
		is_active BOOLEAN DEFAULT TRUE
	);
	
	CREATE TABLE service_categories(
		service_id BIGINT REFERENCES services(id),
		category_id BIGINT REFERENCES categories(id),
		PRIMARY KEY (service_id,category_id)
	);
	CREATE TABLE product_categories(
		product_id BIGINT REFERENCES product_master(id),
		category_id BIGINT REFERENCES categories(id),
		PRIMARY KEY (product_id,category_id)
	);
	CREATE TABLE product_options(
		id BIGSERIAL PRIMARY KEY,
		product_id BIGINT NOT NULL REFERENCES product_master(id) ON DELETE CASCADE,
		name VARCHAR(50) NOT NULL,
		UNIQUE (product_id, name)
	);
	CREATE TABLE product_option_values(
		id BIGSERIAL PRIMARY KEY,
		option_id BIGINT NOT NULL REFERENCES product_options(id) ON DELETE CASCADE,
		value VARCHAR(50) NOT NULL,
		UNIQUE (option_id, value)
	);
	CREATE TABLE product_variants(
		id BIGSERIAL PRIMARY KEY,
		product_id BIGINT NOT NULL REFERENCES product_master(id) ON DELETE CASCADE,
		sku VARCHAR(50) NOT NULL UNIQUE,
		price NUMERIC(10,2) NOT NULL,
		inventory_quantity INT NOT NULL DEFAULT 0,
		created_at TIMESTAMP DEFAULT NOW(),
		updated_at TIMESTAMP DEFAULT NOW()
	);
	CREATE TABLE variant_option_values(
		variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
		option_value_id BIGINT NOT NULL REFERENCES product_option_values(id) ON DELETE CASCADE,
		PRIMARY KEY (variant_id,option_value_id)
	);
	CREATE TABLE product_attributes(
		id BIGSERIAL PRIMARY KEY,
		product_id BIGINT NOT NULL REFERENCES product_master(id) ON DELETE CASCADE,
		key VARCHAR(50) NOT NULL,
		value VARCHAR(100),
		UNIQUE (product_id, key)
	);

	CREATE TABLE auth_otp(
		id UUID PRIMARY KEY,
		user_id TEXT GENERATED ALWAYS AS (email) STORED,
		email TEXT NOT NULL,
		otp_hash TEXT NOT NULL,
		attempts INT NOT NULL DEFAULT 0,
		expires_at TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '10 minutes',
		created_at TIMESTAMP NOT NULL DEFAULT NOW()
	);
	-- select INTERVAL '1 hour 10 min'
	-- CREATE TABLE category_attributes(
	-- 	id BIGSERIAL PRIMARY KEY,
	-- 	category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
	-- 	sort_index INT NOT NULL DEFAULT 1,
		
	-- )

	
	-- OTHER THAN TABLE

	CREATE OR REPLACE FUNCTION enum_master_sort_index()
	RETURNS TRIGGER
	LANGUAGE plpgsql AS $$
	BEGIN
		IF NEW.sort_index IS NULL OR NEW.sort_index = 0 THEN
			SELECT COALESCE(MAX(sort_index),0)+1
			INTO NEW.sort_index
			FROM enum_master
			WHERE master_name = NEW.master_name;
		END IF;
		RETURN NEW;
	END;
	$$;
	
	CREATE TRIGGER trg_enum_sort_index
	BEFORE INSERT ON enum_master
	FOR EACH ROW
	EXECUTE FUNCTION enum_master_sort_index();
COMMIT;




-- DATA BY SYSTEM














-- ROLLBACK
-- create table sell_listings(
-- 	id bigserial primary key,
-- 	user_id bigint,
-- 	category_id
-- )

-- SELECT * FROM public.enum_master
-- ORDER BY id ASC 
-- select * from brands

-- DROPPING TABLES IN ORDER (CHILD >> PARENT)
-- DROP TABLE IF EXISTS brands CASCADE;
-- DROP TABLE IF EXISTS enum_master CASCADE;