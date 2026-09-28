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

/** Neutral placeholder for products uploaded without an image. */
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='200' y='206' font-family='sans-serif' font-size='24' fill='%239ca3af' text-anchor='middle'%3ENo image%3C/text%3E%3C/svg%3E";


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

  const formatPrice = (price: number) =>
    `MWK ${price.toLocaleString()}`;

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

        <main className="mx-auto max-w-7xl px-4 py-6">

            {/* Main Product */}
            <div className="grid gap-8 rounded-2xl bg-white p-5 shadow-sm lg:grid-cols-2 lg:p-8">

            {/* ================= IMAGE ================= */}
            <div>

                <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">

                {/* Image */}
                <img
                    src={product[0]?.imageUrl ?? PLACEHOLDER_IMAGE}
                    alt={product[0]?.name}
                    className="h-full w-full object-contain p-8"
                />

                </div>

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

                {/* WhatsApp Button */}
                <button
                onClick={orderOnWhatsApp}
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-green-600 px-6 py-4 font-semibold text-white transition hover:bg-green-700"
                >
                <MessageCircle size={22} />
                Order on WhatsApp
                </button>

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
                    </div>
                </div>

                </div>

                <div className="my-5 border-t" />

                <p className="text-sm text-gray-500">
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