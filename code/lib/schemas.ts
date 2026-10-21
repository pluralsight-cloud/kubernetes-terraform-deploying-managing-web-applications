import { z } from "zod";

export const productSchema = z.object({
  type: z.enum(["home", "robotics"]),
  title: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().optional(),
  image: z.string().min(1),
  link: z.string().min(1),
  sortOrder: z.coerce.number().int(),
});

export const categorySchema = z.object({
  title: z.string().min(1),
  image: z.string().min(1),
  sortOrder: z.coerce.number().int(),
});

export const mediaSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  image: z.string().min(1),
  layout: z.enum(["image-right", "image-left"]),
  sortOrder: z.coerce.number().int(),
});

export const storySchema = z.object({
  title: z.string().min(1),
  paragraphs: z.array(z.string()).min(1),
  sidebarTitle: z.string().min(1),
  sidebarBody: z.string().min(1),
  sidebarImage: z.string().min(1),
  sortOrder: z.coerce.number().int(),
});

export const eventSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  description: z.string().min(1),
  ctaLabel: z.string().min(1),
  active: z.boolean(),
});

export const registrationSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  eventId: z.string().optional(),
});

export const pageContentSchema = z.object({
  slug: z.enum(["home", "our-story", "robotics", "media"]),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  heroImage: z.string().min(1),
  paragraphs: z.array(z.string()).optional(),
});
