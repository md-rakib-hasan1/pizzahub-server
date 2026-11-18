
import { z } from "zod";

export const createMenuSchema = z.object({
    title: z
        .string()
        .trim()
        .min(3, "Pizza title must be at least 3 characters.")
        .max(100, "Pizza title cannot exceed 100 characters."),

    description: z
        .string()
        .trim()
        .min(10, "Description must be at least 10 characters.")
        .max(1000, "Description cannot exceed 1000 characters."),

    category: z
        .string()
        .trim()
        .min(1, "Category is required."),

    price: z
        .number()
        .positive("Price must be greater than zero."),

    image: z
        .string()
        .url("Please provide a valid image URL."),

    location: z
        .string()
        .trim()
        .min(2, "Location is required."),

    ingredients: z
        .array(z.string().trim().min(1))
        .min(1, "At least one ingredient is required."),

    isAvailable: z.boolean().default(true),
});


export const updateMenuSchema = createMenuSchema
    .partial()
    .extend({
        isAvailable: z.boolean().optional(),
    })
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            message: "At least one field is required for update.",
        }
    );