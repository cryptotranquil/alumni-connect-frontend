import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductApi } from "@/api/productsApi";
import { getBusinessApi } from "@/api/businessApi";
import type { Business } from "@/types/business";
import type { Product } from "@/types/product";
import PageContainer from "@/components/layout/PageContainer";

import {
  MessageCircle,
  Star,
} from "lucide-react";


export default function ProductDetails() {
  const [product, setProduct] = useState<Product[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);

const { product_id } = useParams();
const navigate  = useNavigate();
const loadProduct = useCallback(() => {
    if (!product_id) {
        return;
    }
    void getProductApi(product_id)
        .then(async (product_data) => {
            setProduct(product_data);
            if (product_data[0]?.businessId) {
                const business_data = await getBusinessApi(
                    product_data[0].businessId,
                ).catch(() => []);
                setBusiness(business_data[0] ?? null);
            }
        })
        .catch((error: unknown) => {
            console.error("Failed to load product", error);
        });
}, [product_id]);

useEffect(() => {
    void loadProduct();
}, [loadProduct]);
// console.log(product[0]?.businessId.name);
  const formatPrice = (price: number) =>
    `MWK ${price.toLocaleString()}`;

//   const nextImage = () => {
//     setActiveImage((current) =>
//       current === product.images.length - 1 ? 0 : current + 1
//     );
//   };

//   const previousImage = () => {
//     setActiveImage((current) =>
//       current === 0 ? product.images.length - 1 : current - 1
//     );
//   };

  const orderOnWhatsApp = () => {
    const message = `Hello ${product[0].name},

    I am interested in this product:

    Product: ${product[0].name}
    Price: ${formatPrice(product[0].price)}

    Please let me know if it is available.`;

    if (!business?.contact_phone) return;

    window.open(
      `https://wa.me/${"+265" + business.contact_phone}?text=${encodeURIComponent(
        message
      )}`,
      "_blank"
    );
  };

  return (
    <PageContainer title="Product Details">
        <div className="min-h-screen bg-gray-50">

        {/* Page Header */}
        {/* <div className="border-b bg-white">
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4">

            <button
                onClick={() => window.history.back()}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
            >
                <ArrowLeft size={20} />
            </button>

            <div>
                <p className="text-xs text-gray-500">
                Products
                </p>

                <h1 className="font-semibold text-gray-900">
                Product Details
                </h1>
            </div>

            </div>
        </div> */}

        <main className="mx-auto max-w-7xl px-4 py-6">

            {/* Breadcrumb */}
            {/* <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
            <span>Home</span>
            <span>/</span>
            <span>{product.category}</span>
            <span>/</span>
            <span className="text-gray-900">
                {product.name}
            </span>
            </div> */}

            {/* Main Product */}
            <div className="grid gap-8 rounded-2xl bg-white p-5 shadow-sm lg:grid-cols-2 lg:p-8">

            {/* ================= IMAGE ================= */}
            <div>

                <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">

                {/* Discount */}
                {/* <div className="absolute left-4 top-4 z-10 rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white">
                    {discount}% OFF
                </div> */}

                {/* Wishlist */}
                {/* <button
                    onClick={() => setLiked(!liked)}
                    className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow"
                >
                    <Heart
                    size={20}
                    className={
                        liked
                        ? "fill-red-500 text-red-500"
                        : "text-gray-700"
                    }
                    />
                </button> */}

                {/* Previous */}
                {/* <button
                    onClick={previousImage}
                    className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow"
                >
                    <ChevronLeft size={20} />
                </button> */}

                {/* Image */}
                <img
                    src="../../iphone2.jpg"
                    alt={product[0]?.name}
                    className="h-full w-full object-contain p-8"
                />

                {/* Next */}
                {/* <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow"
                >
                    <ChevronRight size={20} />
                </button> */}

                </div>

                {/* Thumbnails */}
                {/* <div className="mt-4 grid grid-cols-4 gap-3">

                {product.images.map((image, index) => (
                    <button
                    key={image}
                    onClick={() => setActiveImage(index)}
                    className={`aspect-square overflow-hidden rounded-lg border-2 ${
                        activeImage === index
                        ? "border-gray-900"
                        : "border-transparent"
                    }`}
                    >
                    <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="h-full w-full object-cover"
                    />
                    </button>
                ))}

                </div> */}

            </div>

            {/* ================= INFORMATION ================= */}
            <div>

                {/* Category */}
                <p className="text-sm font-medium text-gray-500">
                {product[0]?.category}
                </p>

                {/* Name */}
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                {product[0]?.name}
                </h2>

                {/* Rating */}
                {/* <div className="mt-4 flex items-center gap-3">

                <div className="flex items-center gap-1">

                    <Star
                    size={18}
                    className="fill-yellow-400 text-yellow-400"
                    />

                    <span className="font-semibold">
                    {product.rating}
                    </span>

                </div>

                <span className="text-gray-300">|</span>

                <span className="text-sm text-gray-500">
                    {product.reviews} customer reviews
                </span>

                </div> */}

                {/* Price */}
                <div className="mt-6 flex items-center gap-3">

                <span className="text-3xl font-bold text-gray-900">
                    {/* {formatPrice(product[0]?.price)} */}
                </span>

                {/* <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.oldPrice)}
                </span>

                <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">
                    SAVE {discount}%
                </span> */}

                </div>

                {/* Availability */}
                <div className="mt-4 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

                <span className="text-sm font-medium text-green-600">
                    In Stock
                </span>
                </div>

                <div className="my-7 border-t" />

                {/* Description */}
                <div>
                <h3 className="font-semibold text-gray-900">
                    About this product
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                    {product[0]?.description}
                </p>
                </div>

                {/* Color */}
                {/* <div className="mt-6">

                <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    Color: {selectedColor}
                </h3>

                <div className="flex flex-wrap gap-2">

                    {product.colors.map((color) => (
                    <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`rounded-lg border px-5 py-2 text-sm ${
                        selectedColor === color
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-300 bg-white text-gray-700"
                        }`}
                    >
                        {color}
                    </button>
                    ))}

                </div>

                </div> */}

                {/* Size */}
                {/* <div className="mt-6">

                <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    Size
                </h3>

                <div className="flex gap-2">

                    {product.sizes.map((size) => (
                    <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`flex h-10 w-12 items-center justify-center rounded-lg border text-sm ${
                        selectedSize === size
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-300"
                        }`}
                    >
                        {size}
                    </button>
                    ))}

                </div>

                </div> */}

                {/* WhatsApp Button */}
                <button
                onClick={orderOnWhatsApp}
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-green-600 px-6 py-4 font-semibold text-white transition hover:bg-green-700"
                >
                <MessageCircle size={22} />
                Order on WhatsApp
                </button>

                {/* Share / Wishlist */}
                {/* <div className="mt-4 flex gap-3">

                <button
                    onClick={() => setLiked(!liked)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium hover:bg-gray-50"
                >
                    <Heart
                    size={18}
                    className={
                        liked
                        ? "fill-red-500 text-red-500"
                        : ""
                    }
                    />

                    Wishlist
                </button>

                <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium hover:bg-gray-50">
                    <Share2 size={18} />
                    Share
                </button>

                </div> */}

            </div>
            </div>

            {/* ================= LOWER DETAILS ================= */}
            <div className="mt-8 grid gap-8 lg:grid-cols-3">

            {/* Description */}
            <section className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">

                <h2 className="text-xl font-bold text-gray-900">
                Product Details
                </h2>

                <p className="mt-4 leading-7 text-gray-600">
                {product[0]?.description}
                </p>

                {/* Specifications */}
                {/* <div className="mt-6">

                <h3 className="font-semibold text-gray-900">
                    Specifications
                </h3>

                <div className="mt-4 divide-y rounded-lg border">

                    {product.specifications.map(
                    ([label, value]) => (
                        <div
                        key={label}
                        className="grid grid-cols-2 px-4 py-3 text-sm"
                        >
                        <span className="text-gray-500">
                            {label}
                        </span>

                        <span className="font-medium text-gray-900">
                            {value}
                        </span>
                        </div>
                    )
                    )}

                </div>

                </div> */}
            </section>

            {/* Seller */}
            <section className="h-fit rounded-2xl bg-white p-6 shadow-sm">

                <p className="text-xs text-gray-500">
                Sold by
                </p>

                <div className="mt-4 flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
                    🏪
                </div>

                <div>
                    <h3 className="font-semibold text-gray-900">
                    {business?.name}
                    </h3>

                    <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                    <Star
                        size={14}
                        className="fill-yellow-400 text-yellow-400"
                    />

                    {/* {product.vendor.rating} */}
                    </div>
                </div>

                </div>

                <div className="my-5 border-t" />

                <p className="text-sm text-gray-500">
                {/* {product.vendor.products} products listed */}
                </p>

                <button 
                    onClick={() => navigate(`/student/business_details/${business?._id ?? product[0]?.businessId}`)}
                    className="mt-5 w-full rounded-lg border border-gray-900 py-3 text-sm font-semibold hover:bg-gray-900 hover:text-white">
                Visit Store
                </button>

            </section>

            </div>

        </main>
        </div>
    </PageContainer>
  );
}