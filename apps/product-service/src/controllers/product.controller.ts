
import { NextFunction, Request, Response } from "express";
import prisma from "@packages/prisma";
import { AuthError, NotFoundError, ValidationError } from "@packages/error-handler";
import { imagekit } from "packages/libs/imageKit";
import { Prisma } from "@prisma/client";

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
      public_name,  discountType, discountValue, discountCode } = req.body;

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

    const sellerId = req.seller?.id || req.admin?.id;

    if (!sellerId) {
      return res.status(401).json({ message: "Unauthorized for Seller or Admin!" });
    }

    const discount_codes = await prisma.discount_codes.findMany({
      where: { sellerId },
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

    const sellerId = req.seller?.id || req.admin?.id;
    if (!sellerId) {
      return res.status(401).json({ message: "Unauthorized for Seller or Admin!" });
    }

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
  req: Request, res: Response, next: NextFunction
) => {
  try {
    
    const { fileId } = req.body;
    console.log("fileId received:", fileId); // ← check if it's arriving

    if (!fileId) {
      return res.status(400).json({ success: false, message: "fileId is required" });
    }

    const response = await imagekit.deleteFile(fileId);
    res.status(200).json({ success: true, response });

  } catch (error) {
    console.error('Image delete failed:', error);
    next(error); // ✅ sends error to your error middleware, no hanging
  }
};

import { CreateProductSchema } from "../../schema/product.shecma";
import DOMPurify from "isomorphic-dompurify";

// type CreateProductPayload = {
//   title: string
//   short_description: string
//   detailed_description: string
//   category: string
//   slug: string
//   subCategory: string
//   brand?: string
//   regularPrice: number
//   sale_price?: number
//   stock: number
//   videoUrl?: string
//   cash_on_delivery: string
//   tags: string[] | string
//   colors?: string[]
//   sizes?: string[]
//   starting_date: Date
//   ending_date: Date
//   discountCodes?: string[]
//   images: {
//     fileId: string
//     file_url: string
//   }[]
//   customProperties?: Record<string, any>
//   custom_specifications?: Record<string, any>
// }


export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

  const parsed = CreateProductSchema.safeParse(req.body);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  const {
    title,
    short_description,
    detailed_description,
    category,
    slug,
    subCategory,
    regularPrice,
    stock,
    tags,
    images, // ARRAYS Of IMAGES
    cash_on_delivery,
    sale_price,
    brand,
    videoUrl,
    colors,
    sizes,
    discountCodes,
    customProperties,
    custom_specifications,
  } = parsed.data;

  
  //! AUTH-ERROR AUTH-ERROR AUTH-ERROR
  const seller = (req as any).seller || (req as any).admin;

  if (!seller || !seller.id) {
      return next (new AuthError('Only seller and admin can create product!'))
    }

    //todo . Basic Validation
    const requiredFields = { title, slug, detailed_description,short_description, category, 
                              cash_on_delivery, subCategory, tags, images, regularPrice, stock };

    //todo. Filter the object keys
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value || (Array.isArray(value) && value.length === 0))
      .map(([key]) => key);
      
    if (missingFields.length > 0) {
      throw new ValidationError(`Missing required fields: ${missingFields.join(", ")}`);
    }
      
    // Convert comma-separated tags string into a clean array
    let formattedTags: string[] = [];

    if (Array.isArray(tags)) {
       formattedTags = tags as string[];
    } else if (tags && typeof tags === 'string') {
      formattedTags = tags.split(',').map(tag => tag.trim());
    }

    //todo . SLUG Checking
    const slugChecking = await prisma.product.findUnique({
      where: {
        slug: slug,
    },  
    });
      if (slugChecking) {
      return next( new ValidationError("Slug already exist! Please use a different slug!") );
    }


    const clean = {
      title:                DOMPurify.sanitize(parsed.data.title),
      short_description:    DOMPurify.sanitize(parsed.data.short_description),
      detailed_description: DOMPurify.sanitize(parsed.data.detailed_description ?? ""),
      category:             DOMPurify.sanitize(parsed.data.category),
      subCategory:          DOMPurify.sanitize(parsed.data.subCategory),
      brand:                parsed.data.brand ? DOMPurify.sanitize(parsed.data.brand) : undefined,
      slug:                 DOMPurify.sanitize(parsed.data.slug),
      videoUrl:             parsed.data.videoUrl ? DOMPurify.sanitize(parsed.data.videoUrl) : undefined,
      tags:                 formattedTags.map(tag => DOMPurify.sanitize(tag)),
      colors:               (parsed.data.colors ?? []).map(c => DOMPurify.sanitize(c)),
      sizes:                (parsed.data.sizes ?? []).map(s => DOMPurify.sanitize(s)),
    };

    // Then pass clean to Prisma
    const newProduct = await prisma.product.create({
      data: {
        title:               clean.title,
        short_description:   clean.short_description,
        detailed_description:clean.detailed_description,
        category:            clean.category,
        subCategory:         clean.subCategory,
        brand:               clean.brand,
        slug:                clean.slug,
        shopId:              seller?.shop.id!,
        sizes:               clean.sizes,
        stock:               parsed.data.stock,              // already a number from Zod, no parseInt needed
        salePrice:           parsed.data.sale_price ?? 0,    // already a number from Zod, no parseFloat needed
        regularPrice:        parsed.data.regularPrice,       // already a number from Zod
        colors:              clean.colors,
        custom_property:     parsed.data.customProperties ?? {},
        custom_specification:parsed.data.custom_specifications ?? {},
        images: {
          create: parsed.data.images
            .filter((img) => img.fileId && img.file_url)
            .map((img) => ({
              file_id: img.fileId,
              url:     img.file_url,
            })),
        },
        cashOnDelivery:  parsed.data.cash_on_delivery === "yes",
        starting_date:   parsed.data.starting_date ? new Date(parsed.data.starting_date) : new Date(),
        video_url:       clean.videoUrl,
        tags:            clean.tags,
        discount_codes:
          parsed.data.discountCodes && parsed.data.discountCodes.length > 0
            ? {
                connect: parsed.data.discountCodes
                  .filter((id) => id && id.trim() !== "")
                  .map((id) => ({ id })),
              }
            : undefined,
      },
      include: { images: true },
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

export const getShopProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const role = (req as any)?.role;
    const sellerId = role === "admin" ? (req as any)?.admin?.id  
      : (req as any)?.seller?.id;     

    if (!sellerId) {
      return res.status(400).json({ message: "Seller ID not found!" });
    }

    const shop = await prisma.shops.findUnique({
      where: { sellerId },
    });

    if (!shop) {
      return res.status(404).json({ message: "Shop not found!" });
    }

    const products = await prisma.product.findMany({
      where: { shopId: shop.id }, // ✅ always scoped to ONE shop
      include: { images: true },
    });

    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        role: string;
      };
      seller?: {
        id: string;
        name: string;
        role: string;
        shop: {
          id: string;
          name:string
        };
      };
    }
  }
}

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params; // Make sure the route has /:productId
    const sellerId = (req).seller?.shop?.id;

    if (!sellerId) {
      return res.status(403).json({ message: "Unauthorized: No seller found." });
    }

    // Find the product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true, isDeleted: true },
    });

    if (!product) {
      return next(new ValidationError('Product Not Found!'));
    }

    if (product.shopId !== sellerId) {
      return res.status(403).json({ message: "Unauthorized:This is  not your product." });
    }

    if (product.isDeleted){
      return next(new ValidationError('Product is already deleted'))
    }

    // Mark the product as deleted (soft delete)
    const deletedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
         isDeleted: true,
        deleteAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
       },
    });

    res.status(200).json({ message: "Product deleted successfully.", deletedProduct });
  } catch (error) {
    next(error);
  }
};

export const restoreProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params; // Ensure your route is /:productId
    const sellerId = (req as any).seller?.shop?.id;

    if (!sellerId) {
      return res.status(403).json({ message: "Unauthorized: No seller found." });
    }

    // Find the product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true, isDeleted: true },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Check if the product belongs to this seller
    if (product.shopId !== sellerId) {
      return next(new ValidationError("Unauthorized: Not your product."));
    }

    // Check if the product is actually deleted
    if (!product.isDeleted) {
      return res.status(400).json({ message: "Product is not deleted." });
    }

    // Restore the product
    const restoredProduct = await prisma.product.update({
      where: { id: productId },
      data: { isDeleted: false, deleteAt: null },
    });

    res.status(200).json({
      message: "Product successfully restored!", restoredProduct,
    });
    
  } catch (error) {
    return  res.status(500).json({
      success: false,
      message: "Error restorring product!",
    });
  }
};

    // GET ALL PRODUCTS
  export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const type = req.query.type;
    const now = new Date();


  const allProducts = await prisma.product.findMany({
      select: { id: true, title: true, starting_date: true, ending_date: true, status: true }
    });
    console.log('📊 TOTAL PRODUCTS IN DB BEFORE LOGIC:', allProducts.length);
    console.log('📊 First product sample:', allProducts[1]);

    // Correct date filter with proper Prisma typing 
    const baseFilter: Prisma.productWhereInput = {
      isDeleted: false,
      status: "Active",
      
      //!THIS SORTING UNKNOWINGLY WITHOUT THROWING ERROR STOP PRODUCTS FROM SHOWING
      AND: [
        { OR: [
             { starting_date: { lte : now } }
          ]
        },
        {
          OR: [
            { ending_date: { equals: null } },
            { ending_date: { gte: now } }
          ]
        }
       ]
    };

    const orderBy: Prisma.productOrderByWithRelationInput =
      type === "latest"
        ? { createdAt: "desc" }
        : { totalSales: "desc" };
      

    const [productsResult, totalResult, top10latestProducts] = await Promise.allSettled([
      // Fetch paginated products
      prisma.product.findMany({
        skip,
        take: limit,
        include: {
          images: true,
          Shop: true,
        },
        // where: baseFilter,
        orderBy
      }),

      // Count total products matching filter
      prisma.product.count({
        // where: baseFilter,
      }),


    // Fetch top 10 products by totalSales
    prisma.product.findMany({
        take: 10,
        orderBy: { totalSales: "desc" },
        include: {
          images: true,
          Shop: true,
        },
        where: {
          isDeleted: false,
          status: "Active",
          AND: [
              {
              OR: [
                { starting_date: { lte: now } }
              ]
            },
          ]
        }
      }),
    ]);


  const products = productsResult.status === 'fulfilled' ? productsResult.value : [];
  const total = totalResult.status === 'fulfilled' ? totalResult.value : 0;
  
  console.log("Changed products after all the logic ",  )

    //! --------------  PRINT DEBUGGING  -------------- --------------    
    const queryNames = ["Products List", "Total Count", "Top 10 Products"];
    [productsResult, totalResult, top10latestProducts].forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`❌ ${queryNames[index]} Failed:`, result.reason);
    }
  });

  const response = {
      products,
      topBy: type,           
      top10latestProducts,
      total,
      currentPage: page,
      orderType: type === "latest" ? "latest" : "topSales",
      totalPages: Math.ceil(total / limit),
    };
      res.status(200).json(response)

    } catch (error) {
      next(error);
  }
};


   // GET SINGLE PRODUCT DETAILS
  export const getProductDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await prisma.product.findUnique({
      where: {
        slug: req.params.slug!,
      },
      include: {
        images: true,
        Shop: true,
      },
    });
    
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

      // GET FILETERD PRODCUTS
  export const getFilteredProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      priceRange = [0, 1000],
      categories = [],
      colors = [],
      sizes = [],
      page = 1,
      limit = 12
    } = req.query;
    
    const parsedPriceRange = typeof priceRange === "string" 
    ? priceRange.split(",").map(Number) 
    : [0, 10000];

    const parsedPage = Number(page);
    const parsedLimit = Number(limit)
    
    const skip = (parsedPage - 1) * parsedLimit;
    const filters : any = {
      sale_price: {
        gte: parsedPriceRange[0],
        lte: parsedPriceRange[1],
      },
      starting_date: null,
  };

    if (categories && (categories as string[]).length > 0) {
      filters.category = {
        in: Array.isArray(categories) ? categories : [categories]
      };
    }

    if (colors && (colors as string[]).length > 0) {
      filters.colors = {
        hasSome: Array.isArray(colors) ? colors : [colors]
      };
    }

    if (sizes && (sizes as string[]).length > 0) {
      filters.sizes = {
        hasSome: Array.isArray(sizes) ? sizes : [sizes]
      };
    }

    let [productsResult, totalResult] = await Promise.allSettled([
      prisma.product.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          images: true,
          Shop: true,
        },
      }),
      prisma.product.count({ where: filters }),
    ]);

     const products = productsResult.status === 'fulfilled' ? productsResult.value : [];
     const total = totalResult.status === 'fulfilled' ? totalResult.value : 0;

    const totalPages = Math.ceil(total / parsedLimit);
    res.json({
      products,
      pagination: {
      total,
      page: parsedPage,
      totalPages,
      },
    });

  } catch (error) {
    next(error);
  }

};


  export const getFilteredEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      priceRange = [0, 1000],
      categories = [],
      colors = [],
      sizes = [],
      page = 1,
      limit = 12
    } = req.query;
    
    const parsedPriceRange = typeof priceRange === "string" 
    ? priceRange.split(",").map(Number) 
    : [0, 10000];

    const parsedPage = Number(page);
    const parsedLimit = Number(limit)
    
    const skip = (parsedPage - 1) * parsedLimit;
    const filters :Record<string, any> = {
      sale_price: {
        gte: parsedPriceRange[0],
        lte: parsedPriceRange[1],
      },

      //! ONLY CHANGE FROM getFilteredProducts
      NOT : {
        starting_date: null,
      } 
  };

    if (categories && (categories as string[]).length > 0) {
      filters.category = {
        in: Array.isArray(categories) ? categories : [categories]
      };
    }

    if (colors && (colors as string[]).length > 0) {
      filters.colors = {
        hasSome: Array.isArray(colors) ? colors : [colors]
      };
    }

    if (sizes && (sizes as string[]).length > 0) {
      filters.sizes = {
        hasSome: Array.isArray(sizes) ? sizes : [sizes]
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          images: true,
          Shop: true,
        },
      }),
      prisma.product.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / parsedLimit);
    res.json({
      products,
      pagination: {
      total,
      page: parsedPage,
      totalPages,
      },
    });

  } catch (error) {
    next(error);
  }

};

  export const getFilteredShops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      categories = [],
      countries = [],
      page = 1,
      limit = 12
    } = req.query;

    const parsedPage = Number(page);
    const parsedLimit = Number(limit)
    
    const skip = (parsedPage - 1) * parsedLimit;

    const filters :Record<string, any> = {
  };

    if (categories && (categories as string[]).length > 0) {
      filters.category = {
        in: Array.isArray(categories) ? categories : String(categories).split(",")
      };
    }

    if (countries && (countries as string[]).length > 0) {
      filters.country = {
        in: Array.isArray(countries) ? countries : String(countries).split(",")
      };
    }

    const [shops, total] = await Promise.all([
      prisma.shops.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          sellers: true,
          products: true,
          followers: true,
        },
      }),
      prisma.shops.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / parsedLimit);
    res.json({
      shops,
      pagination: {
      total,
      page: parsedPage,
      totalPages,
      },
    });

  } catch (error) {
    next(error);
  }

};

  export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query.q as string;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required." });
    }
    
    const products = await prisma.product.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive"
            }
          },
          {
            short_description: {
              contains: query,
              mode: "insensitive"
            }
          }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return res.status(200).json({ products });
    
  } catch (error) {
    next(error);
  }
};

 export const getTopShops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Aggregate total sales per shop from orders
    const topShopsData = await prisma.order.groupBy({
      by: ["shopId"],
      _sum: {
        total: true,
      },
      orderBy: {
        _sum: {
          total: "desc",
        },
      },
      take: 10,
    });

    // Fetch the corresponding shop details
    const shopIds = topShopsData.map((item : any) => item.shopId);
    
    const shops = await prisma.shops.findMany({
      where: {
        id: {
          in: shopIds,
        },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        address: true,
        coverBanner: true,
        ratings: true,
        followers: true,
        category: true,
      },
    });

    // Merge sales with shop data
    const enrichedShops = shops.map((shop) => {
      const salesData = topShopsData.find((s : any) => s.shopId === shop.id);
      return {
        ...shop,
        totalSales: salesData?._sum.total ?? 0,
      };
    });

    // Sort by total sales and take top 10
    const top10Shops = enrichedShops
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10);

    return res.status(200).json({ shops: top10Shops });
    
  } catch (error) {
    console.error("Error fetching top shops:", error);
    return next(error);
  }
};