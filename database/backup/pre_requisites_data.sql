
INSERT INTO enum_master(
	master_name, option_name)
	VALUES 
	-- USER STATUS
	('user_status','active'),
	('user_status','suspended'),
	('user_status','deleted'),

	-- BRAND-MODEL STATUS
	('brand_model_status','active'),
	('brand_model_status','inactive'),
	('brand_model_status','deprecated'),
	
	-- PRODUCT STATUS active inactive deleted
	('product_status','active'),
	('product_status','inactive'),
	('product_status','deleted'),
	
	-- ORDER STATUS
	('order_status','pending'),
	('order_status','paid'),
	('order_status','shipped'),
	('order_status','cancelled');
	
INSERT INTO roles(
	id,name, description, is_system)
	VALUES
	(1,'user', 'Normal users in application',true),
	(2,'admin', 'Administrator access ',true),
	(3,'seller', 'Will receive leads',true),
	(4,'agents', 'who Pickup and drops items',true);
	
INSERT INTO users(
	email, phone, password)
	VALUES ('sarthak@gmail.com', '7498605559', 'sarthak');
	
INSERT INTO user_profile(
	user_id,first_name,last_name
) VALUES(1,'Sarthak','Misal');

INSERT INTO user_roles (user_id, role_id)
      VALUES (1, 2);

-- AUTH READY
INSERT INTO categories(
	id, name, parent_id, slug)
	VALUES 
	(1,'Electronics', NULL, 'electronics'),
	(2,'Vehicles', NULL, 'vehicles'),
	(3,'Smartphones', 1, 'smartphones');

INSERT INTO brands(
	id, name, slug)
	VALUES
	(1,'Vivo', 'vivo'),
	(2,'Apple', 'apple'),
	(3,'Samsung', 'samsung');
	
INSERT INTO services(
	id,name, slug)
	VALUES 
	(1,'buy', 'buy'),
	(2,'repair', 'repair'),
	(3,'sell', 'sell');

INSERT INTO model_series(
	id, brand_id, name, slug)
	VALUES
	(1, 1, 'Y Series', 'y-series'),
	(2, 1, 'T Series', 't-series'),
	(3, 2, 'Standard', 'standard'),
	(4, 2, 'Pro', 'pro'),
	(5, 2, 'Pro Max', 'pro-max'),
	(6, 3, 'A Series', 'a-series'),
	(7, 3, 'S Series', 's-series');

	
	-- select * from enum_master;
	-- select * from users;
	-- select * from user_profile
	-- select * from roles
	-- select * from categories
	-- select * from brands
	-- select * from services
	-- select * from model_series
	-- select * from auth_otp
	-- drop table auth_otp
-- truncate table categories cascade,models,service_categories,product_categories,product_master,
-- product_options,product_variants,product_attributes,product_option_values,variant_option_values