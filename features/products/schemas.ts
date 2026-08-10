import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.number().positive("Price must be greater than 0."),
  image: z.string().min(1, "Choose a photo."),
  category: z.string().min(1, "Choose a category."),
  available: z.boolean(),
  popular: z.boolean(),
  spicy: z.boolean(),
  vegetarian: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

/** Small curated set of stock food photos — stands in for a real upload pipeline (spec §33, not yet built). */
export const PRODUCT_IMAGE_OPTIONS = [
  "/images/jollof.png",
  "/images/friedrice.png",
  "/images/jollof-spaghetti.jpg",
  "/images/Jollof stir-fry spaghetti.jpg",
  "/images/hamburger.png",
  "/images/soup.jpg",
  "/images/pizza.png",
  "/images/spag.png",
];
