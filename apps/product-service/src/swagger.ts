import swaggerAutogen from "swagger-autogen";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const doc = {
  openapi: "3.0.0",
  info: {
    title: "Product Service API",
    description: "API documentation for product-service in ecommerce platform",
    version: "1.0.0",
  },

  servers: [
    {
      url: "http://localhost:6099",
      description: "Local product service",
    },
  ],

  tags: [
    { name: "Categories", description: "Product categories" },
    { name: "Products", description: "Product management" },
    { name: "Discount Codes", description: "Discount code management" },
    { name: "Images", description: "Product image management" },
  ],

  components: {
    schemas: {
      Product: {
        id: "string",
        title: "string",
        description: "string",
        detailed_description: "string",
        slug: "string",
        category: "string",
        subCategory: "string",
        brand: "string",
        stock: 10,
        regular_price: 100,
        sale_price: 90,
        tags: ["electronics", "phone"],
        colors: ["red", "black"],
        sizes: ["S", "M"],
      },

      DiscountCode: {
        id: "string",
        public_name: "Black Friday",
        discountType: "percentage",
        discountValue: 20,
        discountCode: "BF2025",
      },

      ImageUpload: {
        fileName: "base64-string",
      },
    },
  },
};

const outputFile = join(__dirname, "swagger-output.json");

const endpointsFiles = [
  join(__dirname, "routes/product.routes.ts"),
  join(__dirname, "controllers/product.controller.ts"),
];

const swaggerAutogenInstance = swaggerAutogen({ openapi: "3.0.0" });

swaggerAutogenInstance(outputFile, endpointsFiles, doc).then(() => {
  console.log("Swagger JSON generated successfully");
  process.exit();
});