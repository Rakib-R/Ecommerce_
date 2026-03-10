
import { NextFunction, Request, Response } from "express";
import prisma from "@packages/prisma";
import { AuthError, NotFoundError, ValidationError } from "@packages/error-handler";
import { imagekit } from "packages/libs/imageKit";

// GET product categories
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const config = await prisma.site_config.findFirst();
    
    if(!config) {
        return res.status(404).json({ message: "Categories are not found"})
    }
    return res.status(200).json({
        categories: config.categories,
        subCategories: config.subCategories
    })

  } catch (error) {
    console.error('getCategories error:', error);
    return res.status(500).json({ error: 'Internal server & getCategories error' }); 
  
  }
};


// Create discount codes
export const createDiscountCodes = async (
  req: any, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { 
      public_name,  discountType, discountValue, discountCode, sellerId } = req.body;

    const isDiscountCodeExist = await prisma.discount_codes.findUnique({
        where: {
          discountCode: discountCode,
        },
      });

      if (isDiscountCodeExist) {
        return res.status(400).json({
          success: false,
          message: "Discount code already exists!",
        });
      }

    const discount_code = await prisma.discount_codes.create({
        data: {
          public_name,
          discountType,
          discountValue: parseFloat(discountValue),
          discountCode,
          sellerId: req.seller.id,
        },
      });

     res.status(201).json({
      success: true,
      message: "Discount code created successfully",
      data: discount_code,
    });
  } catch (error) {
    next(error);
  }
};


// GET all discount codes for the current seller
export const getDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const discount_codes = await prisma.discount_codes.findMany({
      where: {
        sellerId: req.seller.id,
      },
      orderBy: {
        createdAt: 'desc', // Optional: brings newest codes to the top
      },
    });

    res.status(200).json({
      success: true,
      discount_codes,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller?.id;

    // 1. Verify existence and ownership
    const discountCode = await prisma.discount_codes.findUnique({
      where: { id },
      select: { id: true, sellerId: true },
    });

    if (!discountCode) {
      return next(new NotFoundError("Discount code not found !"))
    }

    if (discountCode.sellerId !== sellerId) {
      return next(new ValidationError('You are not authorized to delete code!'))
    }

    // 2. Execute deletion
    await prisma.discount_codes.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Discount code deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


// Upload product image
export const uploadProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileName } = req.body; 
    const response = await imagekit.upload({
      file : fileName,
      fileName: `product-${Date.now()}.jpg`,
      folder: "/products" 
    });
    
    res.status(200).json({ data: response , file_url: response.url, fileId: response.fileId});
  } catch (error) {
    next(error);
    }
};

export const deleteProductImage = async (
  req: Request, res: Response, next: NextFunction) => {

  try {
    const { fileId } = req.body;
    const response = await imagekit.deleteFile(fileId);
        res.status(200).json(
          {success : true,
            response });
    }
    catch (error){
      console.log('Image can not be deleted')
    }
}

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const {
      title,
      description,
      detailed_description,
      category,
      slug,
      subCategory,
      brand,
      regularPrice,
      sale_price,
      stock,
      videoUrl,
      cashOnDelivery,
      tags,
      colors,
      sizes,
      discountCodes,
      images, // ARRAYS Of IMAGES
      customProperties,
      custom_specifications,
    } = req.body;

    //todo . Basic Validation
  // 1. Define fields as an object
    const requiredFields = { title, slug, description, category, subCategory, tags, images, regularPrice, sale_price, stock };

    //todo. Filter the object keys
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value || (Array.isArray(value) && value.length === 0))
      .map(([key]) => key);
      
    if (missingFields.length > 0) {
      throw new ValidationError(`Missing required fields: ${missingFields.join(", ")}`);
    }

    //todo .AuthError
    if (!(req as any).seller.id){
      return next (new AuthError('Only seller can create product!'))
    }

    //todo SLUG CHECKING
    const slugChecking = await prisma.product.findUnique({
      where: {
        slug: slug,
    },  
  });
    if (slugChecking) {
    return next( new ValidationError("Slug already exist! Please use a different slug!") );
  }
    // Convert comma-separated tags string into a clean array
    const formattedTags = Array.isArray(tags)
        ? tags  : tags.split(',');

    const newProduct = await prisma.product.create({
        data: {
        title,
        description,
        detailed_description,
        category,
        subCategory,
        brand,
        slug, 
        shopId: (req as any).seller?.shop.id!,
        sizes: sizes || [],
        stock: parseInt(stock),
        sale_price: parseFloat(sale_price),
        regular_price: parseFloat(regularPrice),
        colors: colors || [],
        custom_property: customProperties || {},
        custom_specification: custom_specifications || {},
        images: { 
          create :images
          .filter((img: any) => img && img.fileId && img.file_url)
          .map((img: any) => ({
            file_id: img.fileId,
            url: img.file_url,
          }))},

        starting_date: new Date(), 
        video_url: videoUrl,
        cashOnDelivery : String(cashOnDelivery),
        tags: formattedTags,
       discount_codes: discountCodes && discountCodes.length > 0 ? { connect: discountCodes
        .filter((id: string) => id && id.trim() !== "")
        .map((id: string) => ({ id })) }   : undefined,
      },
      include: { images: true } 
    });
        

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      newProduct
    });

  } catch (error: any) {
    console.error("Creating Product Error:", error);
    
    res.status(500).json({ 
      success: false,  message: "Internal Server Error (Creating Product)", 
      error: error.message 
      
    });
  }
};