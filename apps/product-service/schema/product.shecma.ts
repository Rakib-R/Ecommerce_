

// schemas/product.schema.ts
import { z } from "zod";
// ── Image ────────────────────────────────────────────────────────────────────
const ImageSchema = z.object({
  fileId: z.string().min(1, "Image fileId is required"),
  file_url: z
    .string()
    .url("Invalid image URL")
    .refine(
      (url : any) => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(url),
      "Image URL must point to a valid image file"
    ),
});

// ── Discount Code ────────────────────────────────────────────────────────────
const DiscountCodeSchema = z
  .string()
  .uuid("Each discount code must be a valid UUID")
  .min(1);

// ── Custom Property / Specification ─────────────────────────────────────────
const CustomPropertySchema = z.record(
  z.string(), 
  z.union([z.string(), z.number(), z.boolean()]).optional()
);

const CustomSpecificationsSchema = z.record(
  z.string(), z.union([z.string(), z.number(), z.boolean()]).optional()
)
// ── Main Product Schema ──────────────────────────────────────────────────────
export const CreateProductSchema = z.object({
  // Basic Info
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title must be under 150 characters")
    .trim(),

  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(200, "Slug too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase letters, numbers, and hyphens only (e.g. my-product)"
    )
    .trim(),

  short_description: z
    .string()
    .min(10, "Short description must be at least 10 characters")
    .max(150, "Short description must be under 300 characters")
    .trim(),

  detailed_description: z
    .string()
    .min(400, "Short description must be at least 400 characters")
    .max(5000, "Detailed description is too long"),

  // Categorization
  category: z
    .string()
    .min(1, "Category is required")
    .max(100),

  subCategory: z
    .string()
    .min(1, "Sub-category is required")
    .max(100),

  brand: z
    .string()
    .max(100, "Brand name too long")
    .optional(),

  // Pricing
  regularPrice: z
    .number({ error: "Regular price must be a number" })
    .positive("Regular price must be greater than 0")
    .max(5_000_000, "Regular price seems unrealistically high"),

  salePrice: z
    .number({ error: "Sale price must be a number" })
    .min(0, "Sale price cannot be negative")
    .max(5_000_00, "Sale price seems unrealistically high")
    .optional(),

  // Stock  Stock Stock
  stock: z
    .number({ error: "Stock must be a number" })
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .max(1_000_00, "Stock value seems unrealistically high"),

  // Media Media Media 
  images: z
    .array(z.union([ImageSchema, z.null()]))  // ✅ accept nulls
    .transform(imgs => imgs.filter(Boolean))  // ✅ strip them out
    .pipe(z.array(ImageSchema).min(1, "At least one image is required").max(10)),

  videoUrl: z
    .string()
    .url("Invalid video URL")
    .refine(
      (url : any) => /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/.test(url),
      "Video URL must be from YouTube or Vimeo"
    )
    .optional()
    .or(z.literal("")), // Allow empty string

  // Variants
  tags: z
    .union([
      z.array(z.string().min(1).max(50)).min(1, "At least one tag is required").max(20, "Max 20 tags"),
      z.string().min(1, "At least one tag is required"), // comma-separated
    ]),

  colors: z
    .array(z.string().max(100))
    .max(20, "Max 20 colors")
    .optional()
    .default([]),

  sizes: z
    .array(z.string().max(20))
    .max(20, "Max 10 sizes")
    .optional()
    .default([]),

  // Delivery
  cash_on_delivery: z
    .enum(["yes", "no"], {
      error: () => ({ message: 'cash_on_delivery must be "yes" or "no"' }),
    }),

  // Dates
  starting_date: z
    .union([
      z.string().datetime({ message: "Invalid date format" }),
      z.date(),
      z.literal(""),
    ])
    .optional()
    .nullish() // ✅ Handles both null and undefined
    .transform(val => (val === "" || val === null) ? undefined : val)
  ,

  // Discount Codes (array of UUIDs)
  discountCodes: z
    .array(DiscountCodeSchema)
    .max(10, "Max 10 discount codes")
    .optional()
    .default([]),

  // Custom fields
  customProperties: CustomPropertySchema,
  customSpecifications: CustomSpecificationsSchema,
});

// ── Inferred Type ────────────────────────────────────────────────────────────
export type CreateProductPayload = z.infer<typeof CreateProductSchema>;