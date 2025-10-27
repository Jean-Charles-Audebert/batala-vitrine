-- Seed admin de test pour E2E Playwright
-- Email: admin@batala.fr, password: SecureP@ss123

-- Note: le hash Argon2 ci-dessous correspond à 'SecureP@ss123'
-- Généré via: await argon2.hash('SecureP@ss123', { type: argon2.argon2id })

INSERT INTO admins (email, password_hash, is_active)
VALUES ('admin@batala.fr', '$argon2id$v=19$m=65536,t=3,p=4$pz+JftZLX2IfbH4g3Wvjaw$hW2b2kV8VqZv3J0S5B7dQcEqZ+FnW7Z4TgW3zJ5M8nQ', TRUE)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_active = TRUE;
