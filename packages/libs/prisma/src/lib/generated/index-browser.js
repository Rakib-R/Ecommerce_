
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.5.0
 * Query Engine version: 173f8d54f8d52e692c7e27e72a88314ec7aeff60
 */
Prisma.prismaVersion = {
  client: "6.5.0",
  engine: "173f8d54f8d52e692c7e27e72a88314ec7aeff60"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.ImagesScalarFieldEnum = {
  id: 'id',
  file_id: 'file_id',
  file_url: 'file_url',
  productId: 'productId',
  userAvatarsId: 'userAvatarsId',
  sellerAvatarsId: 'sellerAvatarsId',
  coverShopId: 'coverShopId'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  name: 'name',
  emailVerified: 'emailVerified',
  image: 'image',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  role: 'role',
  banned: 'banned',
  banReason: 'banReason',
  banExpires: 'banExpires',
  twoFactorEnabled: 'twoFactorEnabled',
  twoFactorSecret: 'twoFactorSecret',
  twoFactorBackupCodes: 'twoFactorBackupCodes'
};

exports.Prisma.UsersScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  emailVerified: 'emailVerified',
  image: 'image',
  authId: 'authId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SellersScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  image: 'image',
  emailVerified: 'emailVerified',
  phone_number: 'phone_number',
  country: 'country',
  stripeId: 'stripeId',
  authId: 'authId',
  stripeOnboarded: 'stripeOnboarded',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VerificationScalarFieldEnum = {
  id: 'id',
  identifier: 'identifier',
  value: 'value',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  expiresAt: 'expiresAt',
  token: 'token',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  userId: 'userId'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  accountId: 'accountId',
  providerId: 'providerId',
  userId: 'userId',
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  idToken: 'idToken',
  accessTokenExpiresAt: 'accessTokenExpiresAt',
  refreshTokenExpiresAt: 'refreshTokenExpiresAt',
  scope: 'scope',
  password: 'password',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ShopsScalarFieldEnum = {
  id: 'id',
  name: 'name',
  category: 'category',
  address: 'address',
  coverBanner: 'coverBanner',
  bio: 'bio',
  opening_hours: 'opening_hours',
  website: 'website',
  socialLinks: 'socialLinks',
  ratings: 'ratings',
  sellerId: 'sellerId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.Shop_followedScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  shopId: 'shopId'
};

exports.Prisma.AddressScalarFieldEnum = {
  id: 'id',
  type: 'type',
  label: 'label',
  name: 'name',
  street: 'street',
  city: 'city',
  zip: 'zip',
  country: 'country',
  userId: 'userId',
  isDefault: 'isDefault',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ShopReviewsScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  shopId: 'shopId',
  rating: 'rating',
  review: 'review',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.Site_configScalarFieldEnum = {
  id: 'id',
  categories: 'categories',
  subCategories: 'subCategories'
};

exports.Prisma.ProductDiscountScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  sellerId: 'sellerId',
  discountCodeId: 'discountCodeId',
  createdAt: 'createdAt'
};

exports.Prisma.Discount_codesScalarFieldEnum = {
  id: 'id',
  public_name: 'public_name',
  discountType: 'discountType',
  discountValue: 'discountValue',
  discountCode: 'discountCode',
  sellerId: 'sellerId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  category: 'category',
  subCategory: 'subCategory',
  short_description: 'short_description',
  detailed_description: 'detailed_description',
  tags: 'tags',
  colors: 'colors',
  sizes: 'sizes',
  video_url: 'video_url',
  brand: 'brand',
  regularPrice: 'regularPrice',
  ratings: 'ratings',
  warranty: 'warranty',
  salePrice: 'salePrice',
  stock: 'stock',
  custom_specification: 'custom_specification',
  custom_property: 'custom_property',
  isDeleted: 'isDeleted',
  cashOnDelivery: 'cashOnDelivery',
  cash_on_delivery: 'cash_on_delivery',
  status: 'status',
  totalSales: 'totalSales',
  shopId: 'shopId',
  sellerId: 'sellerId',
  paymentStatus: 'paymentStatus',
  paymentMethod: 'paymentMethod',
  createdAt: 'createdAt',
  starting_date: 'starting_date',
  ending_date: 'ending_date',
  deleteAt: 'deleteAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  orderNumber: 'orderNumber',
  userId: 'userId',
  shopId: 'shopId',
  total: 'total',
  subtotal: 'subtotal',
  shippingCost: 'shippingCost',
  discount: 'discount',
  status: 'status',
  paymentStatus: 'paymentStatus',
  paymentMethod: 'paymentMethod',
  shippingAddress: 'shippingAddress',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrderItemScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  productId: 'productId',
  productName: 'productName',
  productImage: 'productImage',
  quantity: 'quantity',
  price: 'price',
  total: 'total',
  size: 'size',
  color: 'color'
};

exports.Prisma.UserAnalyticsScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  lastTrained: 'lastTrained',
  country: 'country',
  city: 'city',
  totalVisits: 'totalVisits',
  actions: 'actions',
  pageViews: 'pageViews',
  device: 'device',
  browser: 'browser',
  referrer: 'referrer',
  sessionCount: 'sessionCount',
  lastAction: 'lastAction',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  lastVisited: 'lastVisited'
};

exports.Prisma.ProductAnalyticsScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  shopId: 'shopId',
  views: 'views',
  cartAdds: 'cartAdds',
  wishListAdds: 'wishListAdds',
  purchases: 'purchases',
  lastViewedAt: 'lastViewedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};
exports.SendingAddressType = exports.$Enums.SendingAddressType = {
  SHIPPING: 'SHIPPING',
  BILLING: 'BILLING'
};

exports.addressType = exports.$Enums.addressType = {
  HOME: 'HOME',
  WORK: 'WORK',
  OTHER: 'OTHER'
};

exports.productStatus = exports.$Enums.productStatus = {
  Active: 'Active',
  Pending: 'Pending',
  Draft: 'Draft'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  UNPAID: 'UNPAID',
  PAID: 'PAID',
  REFUNDED: 'REFUNDED',
  FAILED: 'FAILED'
};

exports.PaymentMethod = exports.$Enums.PaymentMethod = {
  CASH_ON_DELIVERY: 'CASH_ON_DELIVERY',
  CARD: 'CARD',
  BANK_TRANSFER: 'BANK_TRANSFER',
  MOBILE_BANKING: 'MOBILE_BANKING'
};

exports.OrderStatus = exports.$Enums.OrderStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED'
};

exports.Prisma.ModelName = {
  images: 'images',
  user: 'user',
  users: 'users',
  sellers: 'sellers',
  Verification: 'Verification',
  Session: 'Session',
  Account: 'Account',
  shops: 'shops',
  shop_followed: 'shop_followed',
  address: 'address',
  shopReviews: 'shopReviews',
  site_config: 'site_config',
  productDiscount: 'productDiscount',
  discount_codes: 'discount_codes',
  product: 'product',
  Order: 'Order',
  OrderItem: 'OrderItem',
  userAnalytics: 'userAnalytics',
  productAnalytics: 'productAnalytics'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
