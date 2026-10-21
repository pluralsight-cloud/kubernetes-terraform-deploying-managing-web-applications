import { ObjectId } from "mongodb";

export type ProductType = "home" | "robotics";

export interface Product {
  _id?: ObjectId | string;
  type: ProductType;
  title: string;
  tagline: string;
  description?: string;
  image: string;
  link: string;
  sortOrder: number;
}

export interface Category {
  _id?: ObjectId | string;
  title: string;
  image: string;
  sortOrder: number;
}

export interface MediaItem {
  _id?: ObjectId | string;
  title: string;
  body: string;
  image: string;
  layout: "image-right" | "image-left";
  sortOrder: number;
}

export interface StorySection {
  _id?: ObjectId | string;
  title: string;
  paragraphs: string[];
  sidebarTitle: string;
  sidebarBody: string;
  sidebarImage: string;
  sortOrder: number;
}

export interface EventDoc {
  _id?: ObjectId | string;
  title: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
  active: boolean;
}

export interface Registration {
  _id?: ObjectId | string;
  name: string;
  email: string;
  eventId?: string;
  createdAt: Date | string;
}

export interface PageContent {
  _id?: ObjectId | string;
  slug: "home" | "our-story" | "robotics" | "media";
  title: string;
  subtitle?: string;
  description?: string;
  heroImage: string;
  paragraphs?: string[];
}

export interface User {
  _id?: ObjectId | string;
  email: string;
  passwordHash: string;
  name: string;
}
