
-- ============ DEMO USERS (dados fictícios) — senha: 123456 ============
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token)
VALUES
('00000000-0000-0000-0000-000000000000','11111111-1111-4111-8111-111111111111','authenticated','authenticated','admin@bemaqui.com', extensions.crypt('123456', extensions.gen_salt('bf')), now(),
 '{"provider":"email","providers":["email"]}', '{"full_name":"Ana Administradora (demo)","account_type":"client","lgpd_consent":"true"}', now(), now(), '', '', '', '', '', '', '', ''),
('00000000-0000-0000-0000-000000000000','22222222-2222-4222-8222-222222222222','authenticated','authenticated','corretor@bemaqui.com', extensions.crypt('123456', extensions.gen_salt('bf')), now(),
 '{"provider":"email","providers":["email"]}', '{"full_name":"Carlos Mendes (demo)","account_type":"broker","phone":"5511999990000","creci":"CRECI-SP 000000-F (fictício)","lgpd_consent":"true"}', now(), now(), '', '', '', '', '', '', '', ''),
('00000000-0000-0000-0000-000000000000','33333333-3333-4333-8333-333333333333','authenticated','authenticated','cliente@bemaqui.com', extensions.crypt('123456', extensions.gen_salt('bf')), now(),
 '{"provider":"email","providers":["email"]}', '{"full_name":"Clara Souza (demo)","account_type":"client","phone":"5511988887777","lgpd_consent":"true"}', now(), now(), '', '', '', '', '', '', '', '');

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES
(gen_random_uuid(), '11111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', '{"sub":"11111111-1111-4111-8111-111111111111","email":"admin@bemaqui.com","email_verified":true}', 'email', now(), now(), now()),
(gen_random_uuid(), '22222222-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', '{"sub":"22222222-2222-4222-8222-222222222222","email":"corretor@bemaqui.com","email_verified":true}', 'email', now(), now(), now()),
(gen_random_uuid(), '33333333-3333-4333-8333-333333333333', '33333333-3333-4333-8333-333333333333', '{"sub":"33333333-3333-4333-8333-333333333333","email":"cliente@bemaqui.com","email_verified":true}', 'email', now(), now(), now());

UPDATE public.profiles SET status = 'approved', is_demo = true, city = 'São Paulo' WHERE id IN ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333');
UPDATE public.profiles SET account_type = 'admin' WHERE id = '11111111-1111-4111-8111-111111111111';
INSERT INTO public.user_roles(user_id, role) VALUES ('11111111-1111-4111-8111-111111111111','admin');

-- Agency (fictícia) owned by demo broker
INSERT INTO public.agencies (id, owner_id, name, cnpj, creci, email, phone, whatsapp, city, state, description, status, is_demo) VALUES
('a0000000-0000-4000-8000-000000000001','22222222-2222-4222-8222-222222222222','Horizonte Imóveis (fictícia)','00.000.000/0001-00','CRECI-J 00000 (fictício)','contato@horizonte.demo','(11) 3000-0000','5511999990000','São Paulo','SP','Imobiliária fictícia para demonstração da plataforma.','approved',true);

UPDATE public.brokers SET status='approved', featured=true, is_demo=true, agency_id='a0000000-0000-4000-8000-000000000001',
  id='b0000000-0000-4000-8000-000000000001',
  bio='Corretor fictício com foco em imóveis de alto padrão e investimentos na Grande São Paulo.', city='São Paulo', specialties=ARRAY['Alto padrão','Investimentos','Lançamentos']
WHERE user_id='22222222-2222-4222-8222-222222222222';

INSERT INTO public.brokers (id, user_id, display_name, creci, bio, whatsapp, city, specialties, featured, status, is_demo) VALUES
('b0000000-0000-4000-8000-000000000002', NULL, 'Mariana Lopes (fictícia)', 'CRECI-RJ 000001 (fictício)', 'Especialista em coberturas e imóveis à beira-mar no Rio de Janeiro.', '5521999990001', 'Rio de Janeiro', ARRAY['Coberturas','Frente mar'], true, 'approved', true),
('b0000000-0000-4000-8000-000000000003', NULL, 'Rafael Antunes (fictício)', 'CRECI-SC 000002 (fictício)', 'Atua no litoral catarinense com casas de praia e investimentos de temporada.', '5548999990002', 'Florianópolis', ARRAY['Litoral','Temporada'], true, 'approved', true),
('b0000000-0000-4000-8000-000000000004', NULL, 'Juliana Prado (fictícia)', 'CRECI-MG 000003 (fictício)', 'Consultora em imóveis comerciais e renda passiva em Belo Horizonte.', '5531999990003', 'Belo Horizonte', ARRAY['Comercial','Renda'], true, 'approved', true);

-- Categories
INSERT INTO public.property_categories (id, name, slug, position) VALUES
('c0000000-0000-4000-8000-000000000001','Casa','casa',1),
('c0000000-0000-4000-8000-000000000002','Apartamento','apartamento',2),
('c0000000-0000-4000-8000-000000000003','Cobertura','cobertura',3),
('c0000000-0000-4000-8000-000000000004','Studio','studio',4),
('c0000000-0000-4000-8000-000000000005','Sala Comercial','sala-comercial',5),
('c0000000-0000-4000-8000-000000000006','Casa de Praia','casa-de-praia',6),
('c0000000-0000-4000-8000-000000000007','Terreno','terreno',7),
('c0000000-0000-4000-8000-000000000008','Galpão','galpao',8);

-- Properties (dados fictícios)
INSERT INTO public.properties (id, owner_id, broker_id, agency_id, category_id, title, slug, description, purpose, price, condo_fee, iptu, area_m2, bedrooms, suites, bathrooms, parking_spots, address, neighborhood, city, state, zip_code, latitude, longitude, status, featured, is_investment, expected_rent, is_demo, published_at, created_at) VALUES
('d0000000-0000-4000-8000-000000000001','22222222-2222-4222-8222-222222222222','b0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000001',
 'Casa contemporânea com piscina no Jardim Europa','casa-contemporanea-jardim-europa','Imóvel fictício para demonstração. Casa de arquitetura contemporânea com amplos vãos, integração total com a área externa, piscina aquecida, espaço gourmet e acabamentos de alto padrão. Localizada em rua arborizada e tranquila, próxima aos principais serviços da região.',
 'venda',4850000,0,18500,420,4,4,6,4,'Rua fictícia, 100','Jardim Europa','São Paulo','SP','01449-000',-23.5770,-46.6830,'published',true,false,NULL,true, now() - interval '20 days', now() - interval '25 days'),
('d0000000-0000-4000-8000-000000000002','22222222-2222-4222-8222-222222222222','b0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000002',
 'Apartamento com vista panorâmica na Vila Olímpia','apartamento-vista-panoramica-vila-olimpia','Imóvel fictício para demonstração. Apartamento em andar alto com vista definitiva, living integrado com varanda, cozinha planejada e suíte master. Condomínio com academia, piscina e segurança 24h.',
 'venda',1890000,2100,6200,142,3,1,3,2,'Rua fictícia, 200','Vila Olímpia','São Paulo','SP','04551-000',-23.5955,-46.6860,'published',true,true,8500,true, now() - interval '15 days', now() - interval '18 days'),
('d0000000-0000-4000-8000-000000000003','22222222-2222-4222-8222-222222222222','b0000000-0000-4000-8000-000000000002',NULL,'c0000000-0000-4000-8000-000000000003',
 'Cobertura duplex com piscina privativa no Leblon','cobertura-duplex-leblon','Imóvel fictício para demonstração. Cobertura duplex com terraço, piscina privativa e vista para o mar. Quatro suítes, home office e elevador privativo.',
 'venda',6200000,4800,22000,380,4,4,5,4,'Avenida fictícia, 300','Leblon','Rio de Janeiro','RJ','22440-000',-22.9840,-43.2240,'published',true,false,NULL,true, now() - interval '12 days', now() - interval '14 days'),
('d0000000-0000-4000-8000-000000000004','22222222-2222-4222-8222-222222222222','b0000000-0000-4000-8000-000000000003',NULL,'c0000000-0000-4000-8000-000000000006',
 'Casa pé na areia em Jurerê Internacional','casa-pe-na-areia-jurere','Imóvel fictício para demonstração. Casa frente mar com deck de madeira, pergolado, cinco suítes e acesso direto à praia. Ideal para moradia ou temporada.',
 'venda',7900000,0,15000,520,5,5,7,4,'Rua fictícia, 400','Jurerê Internacional','Florianópolis','SC','88053-000',-27.4390,-48.4930,'published',true,true,35000,true, now() - interval '10 days', now() - interval '11 days'),
('d0000000-0000-4000-8000-000000000005','22222222-2222-4222-8222-222222222222','b0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000002',
 'Apartamento em condomínio clube no Ecoville','apartamento-condominio-clube-ecoville','Imóvel fictício para demonstração. Apartamento de 3 quartos em condomínio clube com piscina, quadras, salão de festas e playground.',
 'aluguel',6800,1350,320,118,3,1,2,2,'Rua fictícia, 500','Ecoville','Curitiba','PR','81200-000',-25.4380,-49.3400,'published',false,false,NULL,true, now() - interval '8 days', now() - interval '9 days'),
('d0000000-0000-4000-8000-000000000006','22222222-2222-4222-8222-222222222222','b0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000004',
 'Studio mobiliado próximo ao metrô em Pinheiros','studio-mobiliado-pinheiros','Imóvel fictício para demonstração. Studio totalmente mobiliado, a poucos minutos do metrô, com cozinha equipada e lavanderia no prédio.',
 'aluguel',3200,650,90,38,1,0,1,0,'Rua fictícia, 600','Pinheiros','São Paulo','SP','05422-000',-23.5670,-46.6920,'published',false,false,NULL,true, now() - interval '6 days', now() - interval '7 days'),
('d0000000-0000-4000-8000-000000000007','22222222-2222-4222-8222-222222222222','b0000000-0000-4000-8000-000000000004',NULL,'c0000000-0000-4000-8000-000000000005',
 'Sala comercial corporativa na Faria Lima','sala-comercial-faria-lima','Imóvel fictício para demonstração. Laje corporativa com salas de reunião em vidro, ar-condicionado central, piso elevado e vista para a cidade.',
 'aluguel',14500,3800,1200,210,0,0,2,4,'Avenida fictícia, 700','Itaim Bibi','São Paulo','SP','04538-000',-23.5850,-46.6810,'published',false,true,NULL,true, now() - interval '5 days', now() - interval '6 days'),
('d0000000-0000-4000-8000-000000000008','22222222-2222-4222-8222-222222222222','b0000000-0000-4000-8000-000000000004',NULL,'c0000000-0000-4000-8000-000000000004',
 'Studio para investimento no Centro de BH','studio-investimento-centro-bh','Imóvel fictício para demonstração. Studio compacto em edifício novo, com alta procura para locação. Valores de aluguel são estimativas e não garantia de retorno.',
 'venda',420000,480,1100,32,1,0,1,0,'Rua fictícia, 800','Centro','Belo Horizonte','MG','30110-000',-19.9190,-43.9380,'published',false,true,2600,true, now() - interval '4 days', now() - interval '5 days'),
('d0000000-0000-4000-8000-000000000009','22222222-2222-4222-8222-222222222222','b0000000-0000-4000-8000-000000000003',NULL,'c0000000-0000-4000-8000-000000000002',
 'Apartamento frente mar em Balneário Camboriú','apartamento-frente-mar-balneario-camboriu','Imóvel fictício para demonstração. Apartamento com três suítes, sacada com churrasqueira e vista para o mar. Edifício com infraestrutura completa de lazer.',
 'venda',3450000,2600,7800,165,3,3,4,3,'Avenida fictícia, 900','Centro','Balneário Camboriú','SC','88330-000',-26.9900,-48.6330,'published',true,true,15000,true, now() - interval '3 days', now() - interval '4 days'),
('d0000000-0000-4000-8000-000000000010','22222222-2222-4222-8222-222222222222','b0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000001',
 'Casa em condomínio fechado em Alphaville','casa-condominio-alphaville','Imóvel fictício para demonstração. Casa térrea em condomínio com segurança 24h, quatro dormitórios, área gourmet e jardim.',
 'aluguel',18000,1900,0,350,4,3,5,4,'Alameda fictícia, 1000','Alphaville','Barueri','SP','06454-000',-23.4980,-46.8490,'published',false,false,NULL,true, now() - interval '2 days', now() - interval '3 days'),
('d0000000-0000-4000-8000-000000000011','22222222-2222-4222-8222-222222222222','b0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000003',
 'Cobertura com terraço gourmet na Savassi','cobertura-terraco-gourmet-savassi','Imóvel fictício para demonstração. Cobertura com terraço gourmet, piscina e três suítes. Aguardando aprovação do administrador.',
 'venda',2300000,1800,5400,240,3,2,3,3,'Rua fictícia, 1100','Savassi','Belo Horizonte','MG','30140-000',-19.9370,-43.9340,'pending',false,false,NULL,true, NULL, now() - interval '1 days'),
('d0000000-0000-4000-8000-000000000012','22222222-2222-4222-8222-222222222222','b0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000002',
 'Apartamento garden na Barra da Tijuca','apartamento-garden-barra-da-tijuca','Imóvel fictício para demonstração. Apartamento garden com área privativa, churrasqueira e condomínio com lazer completo. Aguardando aprovação do administrador.',
 'venda',1450000,1500,3900,130,3,1,2,2,'Avenida fictícia, 1200','Barra da Tijuca','Rio de Janeiro','RJ','22640-000',-23.0000,-43.3650,'pending',false,false,NULL,true, NULL, now() - interval '12 hours'),
('d0000000-0000-4000-8000-000000000013','22222222-2222-4222-8222-222222222222','b0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000001',
 'Casa térrea no Lago Sul (rascunho)','casa-terrea-lago-sul','Imóvel fictício para demonstração. Anúncio salvo como rascunho.',
 'venda',3100000,0,9000,400,4,2,4,4,'Quadra fictícia, 13','Lago Sul','Brasília','DF','71600-000',-15.8330,-47.8600,'draft',false,false,NULL,true, NULL, now() - interval '2 hours');

-- Images
INSERT INTO public.property_images (property_id, url, position)
SELECT p.pid::uuid, i.url, i.pos FROM (VALUES
 ('d0000000-0000-4000-8000-000000000001','/__l5e/assets-v1/d9529ec5-1756-4257-8c86-3117fc76f12b/demo-casa-1.jpg',0),
 ('d0000000-0000-4000-8000-000000000001','/__l5e/assets-v1/d814edb9-f3b2-49cd-9ed1-a2f1e6cc5e92/demo-cozinha.jpg',1),
 ('d0000000-0000-4000-8000-000000000001','/__l5e/assets-v1/7a5a44ec-bf50-40f3-a7a1-15a097e24664/demo-quarto.jpg',2),
 ('d0000000-0000-4000-8000-000000000002','/__l5e/assets-v1/d3442756-972b-4b55-87f0-44b32f6e97c9/demo-apto-sala.jpg',0),
 ('d0000000-0000-4000-8000-000000000002','/__l5e/assets-v1/d814edb9-f3b2-49cd-9ed1-a2f1e6cc5e92/demo-cozinha.jpg',1),
 ('d0000000-0000-4000-8000-000000000002','/__l5e/assets-v1/7a5a44ec-bf50-40f3-a7a1-15a097e24664/demo-quarto.jpg',2),
 ('d0000000-0000-4000-8000-000000000003','/__l5e/assets-v1/33594107-23e8-47da-a07a-5dbf843d1ae4/demo-cobertura.jpg',0),
 ('d0000000-0000-4000-8000-000000000003','/__l5e/assets-v1/d3442756-972b-4b55-87f0-44b32f6e97c9/demo-apto-sala.jpg',1),
 ('d0000000-0000-4000-8000-000000000003','/__l5e/assets-v1/7a5a44ec-bf50-40f3-a7a1-15a097e24664/demo-quarto.jpg',2),
 ('d0000000-0000-4000-8000-000000000004','/__l5e/assets-v1/6119ce62-a4d0-4bb5-9d68-41d975c12127/demo-casa-praia.jpg',0),
 ('d0000000-0000-4000-8000-000000000004','/__l5e/assets-v1/d814edb9-f3b2-49cd-9ed1-a2f1e6cc5e92/demo-cozinha.jpg',1),
 ('d0000000-0000-4000-8000-000000000004','/__l5e/assets-v1/7a5a44ec-bf50-40f3-a7a1-15a097e24664/demo-quarto.jpg',2),
 ('d0000000-0000-4000-8000-000000000005','/__l5e/assets-v1/650899f6-65de-481f-9d3e-5488f74a76d9/demo-condominio.jpg',0),
 ('d0000000-0000-4000-8000-000000000005','/__l5e/assets-v1/d3442756-972b-4b55-87f0-44b32f6e97c9/demo-apto-sala.jpg',1),
 ('d0000000-0000-4000-8000-000000000006','/__l5e/assets-v1/933563b6-de7e-4adb-af66-a06ff54959ab/demo-studio.jpg',0),
 ('d0000000-0000-4000-8000-000000000007','/__l5e/assets-v1/9aa6f54e-3799-4f54-b3d4-c2e445089d21/demo-sala-comercial.jpg',0),
 ('d0000000-0000-4000-8000-000000000008','/__l5e/assets-v1/933563b6-de7e-4adb-af66-a06ff54959ab/demo-studio.jpg',0),
 ('d0000000-0000-4000-8000-000000000008','/__l5e/assets-v1/650899f6-65de-481f-9d3e-5488f74a76d9/demo-condominio.jpg',1),
 ('d0000000-0000-4000-8000-000000000009','/__l5e/assets-v1/d3442756-972b-4b55-87f0-44b32f6e97c9/demo-apto-sala.jpg',0),
 ('d0000000-0000-4000-8000-000000000009','/__l5e/assets-v1/650899f6-65de-481f-9d3e-5488f74a76d9/demo-condominio.jpg',1),
 ('d0000000-0000-4000-8000-000000000009','/__l5e/assets-v1/d814edb9-f3b2-49cd-9ed1-a2f1e6cc5e92/demo-cozinha.jpg',2),
 ('d0000000-0000-4000-8000-000000000010','/__l5e/assets-v1/d9529ec5-1756-4257-8c86-3117fc76f12b/demo-casa-1.jpg',0),
 ('d0000000-0000-4000-8000-000000000010','/__l5e/assets-v1/7a5a44ec-bf50-40f3-a7a1-15a097e24664/demo-quarto.jpg',1),
 ('d0000000-0000-4000-8000-000000000011','/__l5e/assets-v1/33594107-23e8-47da-a07a-5dbf843d1ae4/demo-cobertura.jpg',0),
 ('d0000000-0000-4000-8000-000000000011','/__l5e/assets-v1/d814edb9-f3b2-49cd-9ed1-a2f1e6cc5e92/demo-cozinha.jpg',1),
 ('d0000000-0000-4000-8000-000000000012','/__l5e/assets-v1/650899f6-65de-481f-9d3e-5488f74a76d9/demo-condominio.jpg',0),
 ('d0000000-0000-4000-8000-000000000012','/__l5e/assets-v1/d3442756-972b-4b55-87f0-44b32f6e97c9/demo-apto-sala.jpg',1),
 ('d0000000-0000-4000-8000-000000000013','/__l5e/assets-v1/d9529ec5-1756-4257-8c86-3117fc76f12b/demo-casa-1.jpg',0)
) AS i(pid, url, pos) CROSS JOIN LATERAL (SELECT i.pid) p;

-- Features
INSERT INTO public.property_features (property_id, name)
SELECT pid::uuid, unnest(feats) FROM (VALUES
 ('d0000000-0000-4000-8000-000000000001', ARRAY['Piscina aquecida','Espaço gourmet','Jardim','Ar-condicionado','Energia solar','Segurança 24h']),
 ('d0000000-0000-4000-8000-000000000002', ARRAY['Varanda','Academia','Piscina','Portaria 24h','Cozinha planejada']),
 ('d0000000-0000-4000-8000-000000000003', ARRAY['Piscina privativa','Vista para o mar','Terraço','Elevador privativo','Home office']),
 ('d0000000-0000-4000-8000-000000000004', ARRAY['Frente mar','Deck','Pergolado','Churrasqueira','Acesso à praia']),
 ('d0000000-0000-4000-8000-000000000005', ARRAY['Condomínio clube','Piscina','Quadra','Playground','Salão de festas']),
 ('d0000000-0000-4000-8000-000000000006', ARRAY['Mobiliado','Próximo ao metrô','Lavanderia']),
 ('d0000000-0000-4000-8000-000000000007', ARRAY['Ar-condicionado central','Piso elevado','Salas de reunião','Recepção']),
 ('d0000000-0000-4000-8000-000000000008', ARRAY['Edifício novo','Alta demanda de locação','Próximo a universidades']),
 ('d0000000-0000-4000-8000-000000000009', ARRAY['Frente mar','Sacada gourmet','Piscina','Academia','Sauna']),
 ('d0000000-0000-4000-8000-000000000010', ARRAY['Condomínio fechado','Área gourmet','Jardim','Segurança 24h']),
 ('d0000000-0000-4000-8000-000000000011', ARRAY['Terraço gourmet','Piscina','Vista panorâmica']),
 ('d0000000-0000-4000-8000-000000000012', ARRAY['Área privativa','Churrasqueira','Lazer completo'])
) AS f(pid, feats);

-- Views (last 30 days)
INSERT INTO public.property_views (property_id, created_at)
SELECT p.id, now() - (random() * interval '30 days')
FROM public.properties p CROSS JOIN generate_series(1, 40) g
WHERE p.status = 'published' AND random() < (CASE WHEN p.featured THEN 0.9 ELSE 0.5 END);

-- Favorites (cliente)
INSERT INTO public.favorites (user_id, property_id) VALUES
('33333333-3333-4333-8333-333333333333','d0000000-0000-4000-8000-000000000001'),
('33333333-3333-4333-8333-333333333333','d0000000-0000-4000-8000-000000000003'),
('33333333-3333-4333-8333-333333333333','d0000000-0000-4000-8000-000000000004');

-- Leads (fictícios)
INSERT INTO public.leads (property_id, user_id, name, email, phone, message, source, status, consent, is_demo, created_at) VALUES
('d0000000-0000-4000-8000-000000000002','33333333-3333-4333-8333-333333333333','Clara Souza (demo)','cliente@bemaqui.com','(11) 98888-7777','Gostaria de agendar uma visita no fim de semana.','site','contacted',true,true, now() - interval '5 days'),
('d0000000-0000-4000-8000-000000000001',NULL,'Pedro Almeida (fictício)','pedro@exemplo.demo','(11) 97777-0001','Aceita permuta por apartamento menor?','site','new',true,true, now() - interval '3 days'),
('d0000000-0000-4000-8000-000000000005',NULL,'Fernanda Reis (fictícia)','fernanda@exemplo.demo','(41) 96666-0002','O condomínio aceita pets?','whatsapp','qualified',true,true, now() - interval '2 days'),
('d0000000-0000-4000-8000-000000000007',NULL,'Startup Exemplo Ltda (fictícia)','contato@startup.demo','(11) 95555-0003','Precisamos de 30 posições de trabalho. Há disponibilidade para março?','site','new',true,true, now() - interval '1 days'),
('d0000000-0000-4000-8000-000000000009',NULL,'Roberto Lima (fictício)','roberto@exemplo.demo','(47) 94444-0004','Tenho interesse para investimento de temporada.','site','converted',true,true, now() - interval '9 days');

INSERT INTO public.lead_notes (lead_id, author_id, channel, note, created_at)
SELECT id, '22222222-2222-4222-8222-222222222222', 'whatsapp', 'Contato realizado via WhatsApp. Visita pré-agendada para sábado às 10h. (registro fictício)', now() - interval '4 days'
FROM public.leads WHERE email = 'cliente@bemaqui.com';

-- Proposals (fictícias)
INSERT INTO public.proposals (id, property_id, client_id, type, amount, payment_conditions, message, client_name, client_email, client_phone, is_demo, created_at) VALUES
('e0000000-0000-4000-8000-000000000001','d0000000-0000-4000-8000-000000000002','33333333-3333-4333-8333-333333333333','compra',1750000,'30% de entrada + financiamento bancário','Proposta para fechamento rápido.','Clara Souza (demo)','cliente@bemaqui.com','(11) 98888-7777',true, now() - interval '4 days'),
('e0000000-0000-4000-8000-000000000002','d0000000-0000-4000-8000-000000000005','33333333-3333-4333-8333-333333333333','aluguel',6500,'Contrato de 30 meses com seguro-fiança','Posso iniciar no próximo mês.','Clara Souza (demo)','cliente@bemaqui.com','(11) 98888-7777',true, now() - interval '1 days');
UPDATE public.proposals SET status = 'countered', amount = 1820000, last_offer_by = '22222222-2222-4222-8222-222222222222' WHERE id = 'e0000000-0000-4000-8000-000000000001';
INSERT INTO public.negotiations (proposal_id, author_id, kind, message, created_at) VALUES
('e0000000-0000-4000-8000-000000000001','22222222-2222-4222-8222-222222222222','message','Olá Clara! O proprietário aceita negociar. Enviamos uma contraproposta de R$ 1.820.000. (mensagem fictícia)', now());

-- Partnership (fictícia)
INSERT INTO public.partnerships (requester_id, partner_broker_id, property_id, commission_split, message)
VALUES ('22222222-2222-4222-8222-222222222222','b0000000-0000-4000-8000-000000000002','d0000000-0000-4000-8000-000000000003',50,'Parceria fictícia para divulgação da cobertura no Leblon.');

-- CMS (fictícios)
INSERT INTO public.testimonials (author_name, author_role, content, rating, is_demo) VALUES
('Luciana M. (fictícia)','Compradora em São Paulo','Encontrei meu apartamento em poucas semanas. O simulador me ajudou a planejar a entrada com segurança.',5,true),
('Eduardo T. (fictício)','Investidor','A análise de investimento deixou claro o rendimento estimado de cada opção antes de eu fazer a proposta.',5,true),
('Patrícia R. (fictícia)','Corretora parceira','O painel profissional organiza leads, propostas e negociações em um só lugar.',5,true);
INSERT INTO public.partners (name, description, website, position, is_demo) VALUES
('Banco Exemplo (fictício)','Parceiro de crédito imobiliário',NULL,1,true),
('Construtora Aurora (fictícia)','Lançamentos residenciais',NULL,2,true),
('Seguros Prisma (fictício)','Seguro-fiança e residencial',NULL,3,true),
('Cartório Digital (fictício)','Documentação e registro',NULL,4,true);
INSERT INTO public.banners (title, subtitle, link_url, position) VALUES
('Seu próximo endereço começa aqui.','Conectando pessoas, imóveis e oportunidades.','/imoveis',1);

INSERT INTO public.reports (property_id, reporter_email, reason, details) VALUES
('d0000000-0000-4000-8000-000000000006','visitante@exemplo.demo','Informação desatualizada','O valor do condomínio parece diferente do informado. (denúncia fictícia)');

INSERT INTO public.activity_logs (actor_id, action, entity, entity_id, details) VALUES
('11111111-1111-4111-8111-111111111111','account_status_changed','profiles','22222222-2222-4222-8222-222222222222','{"from":"pending","to":"approved","demo":true}'),
('11111111-1111-4111-8111-111111111111','property_status_changed','properties','d0000000-0000-4000-8000-000000000001','{"from":"pending","to":"published","demo":true}');
