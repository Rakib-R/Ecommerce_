
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const initializeSiteConfig = async() => {
    try{
        const existingConfig = await prisma.site_config.findFirst();

        if (!existingConfig) {
     await prisma.site_config.create({
                data: {
            categories: [
                "Electronics",
                "Fashion",
                "Home & Kitchen",
                "Sports & Fitness",
                "Foods",
                "Clothes"
            ],
            subCategories: {
                "Electronics": ["Mobile Phones", "Laptops", "Cameras", "Accessories"],
                "Fashion": ["Men's Clothing", "Women's Clothing", "Footwear", "Luxurious"],
                "Home & Kitchen": ["Furniture", "Cookware", "Decor", "Appliances"],
                "Sports & Fitness": ["Gym Equipment", "Outdoor Sports", "Yoga", "Footwear"],
                "Foods & Beverages" : ["Drinks", "Fruits", "Snack","Vegetables"],
                "Clothes": ['Shirts', 'Jeans', 'Sweaters', 'Jackets',]
            }
        }
    });
    }
}
    catch (error){
        return error
    }
}