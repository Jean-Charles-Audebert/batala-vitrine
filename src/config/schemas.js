import { z } from 'zod';

// Schémas pour les settings JSON des éléments
export const textElementSchema = z.object({
  font_size: z.number().min(8).max(72).optional(),
  alignment: z.enum(['left', 'center', 'right']).optional(),
  subtitle: z.string().optional(),
  content: z.string().optional(),
  font_id: z.number().positive().optional(), // Police personnalisée pour cet élément
});

export const mediaElementSchema = z.object({
  url: z.string().url(),
  width: z.number().min(50).max(1200).optional(),
  height: z.number().min(50).max(800).optional(),
  alignment: z.enum(['left', 'center', 'right']).optional(),
  alt: z.string().optional(),
  font_id: z.number().positive().optional(), // Police personnalisée pour cet élément
});

export const cardElementSchema = z.object({
  description: z.string().min(1).max(500),
  media_url: z.string().url().optional(),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  link_url: z.string().url().optional(),
  link_text: z.string().optional(),
  font_id: z.number().positive().optional(), // Police personnalisée pour cet élément
});

export const photoElementSchema = z.object({
  url: z.string().url(),
  caption: z.string().optional(),
  width: z.number().min(100).max(800).optional(),
  height: z.number().min(100).max(600).optional(),
  font_id: z.number().positive().optional(), // Police personnalisée pour cet élément
});

export const videoElementSchema = z.object({
  url: z.string().url(),
  thumbnail_url: z.string().url().optional(),
  autoplay: z.boolean().optional(),
  controls: z.boolean().optional().default(true),
  font_id: z.number().positive().optional(), // Police personnalisée pour cet élément
});

// Union des schémas d'éléments par type
export const elementSettingsSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), ...textElementSchema.shape }),
  z.object({ type: z.literal('media'), ...mediaElementSchema.shape }),
  z.object({ type: z.literal('card'), ...cardElementSchema.shape }),
  z.object({ type: z.literal('photo'), ...photoElementSchema.shape }),
  z.object({ type: z.literal('video'), ...videoElementSchema.shape }),
]);

// Schéma pour les layouts de sections
export const sectionLayoutSchema = z.object({
  type: z.enum(['grid_3x3', 'image_left', 'grid_3', 'grid_2', 'grid_4', 'full_width']),
  columns: z.number().min(1).max(12).optional(),
  gap: z.enum(['small', 'medium', 'large']).optional(),
});

// Schéma pour les settings de sections
export const sectionSettingsSchema = z.object({
  padding_top: z.enum(['none', 'small', 'medium', 'large']).optional(),
  padding_bottom: z.enum(['none', 'small', 'medium', 'large']).optional(),
  background_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  background_image: z.string().url().optional(),
  container: z.enum(['narrow', 'wide', 'full']).optional(),
});

// Schéma pour les settings de page
export const pageSettingsSchema = z.object({
  title: z.string().min(1).max(100),
  title_font_id: z.number().positive(),
  text_font_id: z.number().positive(),
  contact_email: z.string().email(),
});

// Schémas pour les entités complètes
export const elementSchema = z.object({
  id: z.number().optional(),
  section_id: z.number().positive(),
  type: z.enum(['text', 'media', 'card', 'photo', 'video']),
  title: z.string().min(1).max(100),
  position: z.number().min(0),
  settings: elementSettingsSchema,
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export const sectionSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1).max(100),
  show_title: z.boolean().optional().default(true),
  is_visible: z.boolean().optional().default(true),
  position: z.number().min(0),
  layout: sectionLayoutSchema.nullable(),
  settings: sectionSettingsSchema,
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export const pageSchema = z.object({
  id: z.literal(1),
  title: z.string().min(1).max(100),
  title_font_id: z.number().positive(),
  text_font_id: z.number().positive(),
  contact_email: z.string().email(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

// Schémas pour les requêtes API (sans id et timestamps)
export const createElementSchema = elementSchema.omit({ id: true, created_at: true, updated_at: true });
export const updateElementSchema = elementSchema.partial().omit({ id: true, created_at: true, updated_at: true });
export const createSectionSchema = sectionSchema.omit({ id: true, created_at: true, updated_at: true });
export const updateSectionSchema = sectionSchema.partial().omit({ id: true, created_at: true, updated_at: true });
export const updatePageSchema = pageSchema.partial().omit({ id: true, created_at: true, updated_at: true });