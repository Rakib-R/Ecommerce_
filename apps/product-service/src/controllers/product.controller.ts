
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

type CreateProductPayload = {
  title: string
  short_description: string
  detailed_description: string
  category: string
  slug: string
  subCategory: string
  brand?: string
  regularPrice: number
  sale_price?: number
  stock: number
  videoUrl?: string
  cashOnDelivery: string
  tags: string[] | string
  colors?: string[]
  sizes?: string[]
  starting_date: Date
  ending_date: Date
  discountCodes?: string[]
  images: {
    fileId: string
    file_url: string
  }[]
  customProperties?: Record<string, any>
  custom_specifications?: Record<string, any>
}


export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

  const body = req.body as CreateProductPayload;

  const {
    title,
    short_description,
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
  } = body;

    //! AUTH-ERROR
    if (!(req as any).seller.id){
      return next (new AuthError('Only seller can create product!'))
    }

    //todo . Basic Validation
  // 1. Define fields as an object
    const requiredFields = { title, slug, short_description, category, subCategory, tags, images, regularPrice, sale_price, stock };

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


    const newProduct = await prisma.product.create({
        data: {
        title,
        short_description,
        detailed_description,
        category,
        subCategory,
        brand,
        slug, 
        shopId: (req as any).seller?.shop.id!,
        sizes: sizes || [],
        stock: parseInt(String(stock)),
        sale_price: sale_price ? parseFloat(String(sale_price)) : 0,
        regular_price: parseFloat(String(regularPrice)),
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

        starting_date: body.starting_date ? new Date(body.starting_date) : new Date(), 
        video_url: videoUrl,
        cashOnDelivery : String(cashOnDelivery),
        tags: formattedTags,
        discount_codes: discountCodes && discountCodes.length > 0 ? { connect: discountCodes
          .filter((id: string) => id && id.trim() !== "")
          .map((id: string) => ({ id })) }   : undefined,
        } ,
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


export const getShopProducts = async ( req : Request, res: Response, next: NextFunction) => {
  try {
  const products = await prisma.product.findMany({
    where: {
      shopId: (req as any)?.seller?.shop?.id,
    },
    include: {
      images: true,
    },
  });

  console.log("Raw product count:", products.length);
    res.status(201).json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
}


export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params; // Make sure the route has /:productId
    const sellerId = (req as any).seller?.shop?.id; // Assuming you have seller info in req

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
    
    
    // Correct date filter with proper Prisma typing 
    const baseFilter: Prisma.productWhereInput = {
      isDeleted: false,
      status: "Active",
      
      //!THIS SORTING UNKNOWINGLY WITHOUT THROWING ERROR STOP PRODUCTS FROM SHOWING
      AND: [
        { OR: [
            { starting_date: { lte: now } }
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
        where: baseFilter,
        orderBy
      }),

      // Count total products matching filter
      prisma.product.count({
        where: baseFilter,
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