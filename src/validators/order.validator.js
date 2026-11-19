
import { z } from "zod";

export const createOrderSchema = z.object({
  menuItemId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid menu item ID."),

  deliveryDate: z
    .string()
    .datetime({ message: "Invalid delivery date." })
    .refine(
      (value) => new Date(value) > new Date(),
      "Delivery date must be in the future."
    ),

  deliveryAddress: z
    .string()
    .trim()
    .min(10, "Delivery address must be at least 10 characters.")
    .max(300, "Delivery address cannot exceed 300 characters."),

  message: z
    .string()
    .trim()
    .max(500, "Message cannot exceed 500 characters.")
    .optional()
    .default(""),
});
