-- ======================================
--  SEED: Décorations prédéfinies
--  SVG ornements réutilisables
-- ======================================

-- ===============================
--  1. COINS PHOTO (Triangles style album)
-- ===============================
INSERT INTO decorations (
    name, 
    display_name, 
    type, 
    description,
    svg_code,
    default_color,
    default_opacity,
    default_scale,
    supported_positions
) VALUES (
    'photo_corners',
    'Coins photo',
    'corner',
    'Triangles style fixations d''album photo',
    '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M 0 0 L 40 0 L 0 40 Z" fill="currentColor"/></svg>',
    '#e74c3c',
    0.8,
    1.0,
    '["top-left","top-right","bottom-left","bottom-right"]'
);

-- ===============================
--  2. ÉCLABOUSSURE AQUARELLE
-- ===============================
INSERT INTO decorations (
    name, 
    display_name, 
    type, 
    description,
    svg_code,
    default_color,
    default_opacity,
    default_scale,
    supported_positions
) VALUES (
    'watercolor_splash',
    'Éclaboussure aquarelle',
    'overlay',
    'Effet peinture derrière le contenu',
    '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="80" fill="currentColor" opacity="0.3"/><circle cx="80" cy="90" r="60" fill="currentColor" opacity="0.2"/><circle cx="120" cy="110" r="50" fill="currentColor" opacity="0.25"/></svg>',
    '#3498db',
    0.3,
    1.5,
    '["center","top","bottom","left","right"]'
);

-- ===============================
--  3. VAGUES STYLISÉES
-- ===============================
INSERT INTO decorations (
    name, 
    display_name, 
    type, 
    description,
    svg_code,
    default_color,
    default_opacity,
    default_scale,
    supported_positions
) VALUES (
    'waves_pattern',
    'Vagues stylisées',
    'pattern',
    'Motif vagues en fond de section',
    '<svg viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M0,40 Q150,60 300,40 T600,40 T900,40 T1200,40 L1200,120 L0,120 Z" fill="currentColor"/></svg>',
    '#1abc9c',
    0.2,
    1.0,
    '["top","bottom"]'
);

-- ===============================
--  4. CADRE GÉOMÉTRIQUE
-- ===============================
INSERT INTO decorations (
    name, 
    display_name, 
    type, 
    description,
    svg_code,
    default_color,
    default_opacity,
    default_scale,
    supported_positions
) VALUES (
    'geometric_frame',
    'Cadre géométrique',
    'frame',
    'Bordure avec motifs triangulaires',
    '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="3"><rect x="10" y="10" width="380" height="380"/><path d="M 10 10 L 30 30 M 390 10 L 370 30 M 10 390 L 30 370 M 390 390 L 370 370"/></svg>',
    '#2c3e50',
    0.6,
    1.0,
    '["full"]'
);

-- ===============================
--  5. ÉTOILES SCINTILLANTES
-- ===============================
INSERT INTO decorations (
    name, 
    display_name, 
    type, 
    description,
    svg_code,
    default_color,
    default_opacity,
    default_scale,
    supported_positions
) VALUES (
    'sparkles',
    'Étoiles scintillantes',
    'overlay',
    'Petites étoiles décoratives',
    '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M 50 10 L 52 25 L 67 20 L 55 30 L 65 42 L 50 35 L 35 42 L 45 30 L 33 20 L 48 25 Z" fill="currentColor"/><circle cx="20" cy="20" r="3" fill="currentColor"/><circle cx="80" cy="25" r="2" fill="currentColor"/><circle cx="70" cy="70" r="2.5" fill="currentColor"/><circle cx="25" cy="75" r="2" fill="currentColor"/></svg>',
    '#f39c12',
    0.5,
    0.8,
    '["top-left","top-right","bottom-left","bottom-right","center"]'
);

-- ===============================
--  6. RAYURES DIAGONALES
-- ===============================
INSERT INTO decorations (
    name, 
    display_name, 
    type, 
    description,
    svg_code,
    default_color,
    default_opacity,
    default_scale,
    supported_positions
) VALUES (
    'diagonal_stripes',
    'Rayures diagonales',
    'pattern',
    'Motif rayé en arrière-plan',
    '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="stripes" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 0 0 L 20 20 M -5 15 L 5 25 M 15 -5 L 25 5" stroke="currentColor" stroke-width="2"/></pattern></defs><rect width="100" height="100" fill="url(#stripes)"/></svg>',
    '#95a5a6',
    0.15,
    1.0,
    '["full","left","right"]'
);

-- ===============================
--  7. CONFETTIS
-- ===============================
INSERT INTO decorations (
    name, 
    display_name, 
    type, 
    description,
    svg_code,
    default_color,
    default_opacity,
    default_scale,
    supported_positions
) VALUES (
    'confetti',
    'Confettis',
    'overlay',
    'Confettis festifs (événements)',
    '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="30" width="8" height="12" fill="currentColor" transform="rotate(20 24 36)"/><circle cx="60" cy="50" r="5" fill="currentColor" opacity="0.8"/><rect x="100" y="40" width="10" height="6" fill="currentColor" transform="rotate(-15 105 43)"/><circle cx="140" cy="70" r="6" fill="currentColor" opacity="0.7"/><rect x="30" y="120" width="7" height="10" fill="currentColor" transform="rotate(35 34 125)"/><circle cx="80" cy="140" r="4" fill="currentColor"/><rect x="130" y="130" width="9" height="8" fill="currentColor" transform="rotate(-25 135 134)"/><circle cx="170" cy="160" r="5" fill="currentColor" opacity="0.9"/></svg>',
    '#e91e63',
    0.6,
    1.2,
    '["top","center","full"]'
);

-- ===============================
--  8. FEUILLES NATURELLES
-- ===============================
INSERT INTO decorations (
    name, 
    display_name, 
    type, 
    description,
    svg_code,
    default_color,
    default_opacity,
    default_scale,
    supported_positions
) VALUES (
    'leaves',
    'Feuilles naturelles',
    'corner',
    'Ornements végétaux dans les coins',
    '<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><path d="M 10 70 Q 15 50 25 45 Q 35 40 40 30 Q 35 40 30 45 Q 20 50 10 70 Z" fill="currentColor" opacity="0.7"/><path d="M 20 65 Q 30 55 40 52 Q 50 49 60 45 Q 50 50 42 54 Q 32 58 20 65 Z" fill="currentColor" opacity="0.5"/></svg>',
    '#27ae60',
    0.4,
    1.0,
    '["top-left","top-right","bottom-left","bottom-right"]'
);

-- Confirmation
SELECT 
    id, 
    display_name, 
    type, 
    default_color,
    supported_positions
FROM decorations 
ORDER BY id;
