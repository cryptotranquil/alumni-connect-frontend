import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getProductApi, updateProductApi } from "@/api/productsApi";
import type { Product } from "@/types/product";

import PageContainer from "@/components/layout/PageContainer";
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Trash2,
  Save,
  Eye,
} from "lucide-react";

export interface ProductFormData {
    businessId: string;
    name: string;
    price: number;
    quantity: number;
    category: string;
    description: string;
    imageUrl: string;
    inStock: boolean;

}
const ProductDetails = () => {
  const [productImages, setProductImages] = useState([
    "/products/shirt-1.jpg",
    "/products/shirt-2.jpg",
    "/products/shirt-3.jpg",
  ]);

    const { user } = useAuth();
    const [product, setProduct] = useState<Product[]>([]);
  
    // const [logoPreview, setLogoPreview] = useState("");
    // const [bannerPreview, setBannerPreview] = useState("");
  
    const [productFile, setProductFile] = useState(null);
    // const [bannerFile, setBannerFile] = useState(null);
  
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const { product_id } = useParams(); 
    const loadProduct = async () => {
        setLoading(true);
        try{
            if (product_id){
                const product_data = await getProductApi(product_id);
                console.log('fetched', product_data);
                setProduct(product_data);
            }
        } catch (error) {
            console.error("Failed to load product", error);
        } finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProduct();
    }, []);

    const handleChange = (e) => {

        const { name, value } = e.target;
        console.log('fired', name, value, e.target.value);

        setProduct((prev) => {
        return [{
            ...prev[0], [name]: value
        }];
        });
    };
    console.log('product details',product_id, product);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        setSaving(true);
    
        try {
          
           const data = new FormData();
           
            data.append("name", product[0].name);
            data.append("price", product[0].price.toString());
            data.append("category", product[0].category);
            data.append("quantity", product[0].quantity.toString());
            data.append("description", product[0].description);

            // if (logoFile) {
            //   data.append("logo", logoFile.name);
            // }
           
            
                  console.log(data);
    
            if (product_id && data){
              await updateProductApi(product[0]._id, data);
            }
          console.log(data);
    
          // console.log("Business data:", business);
          // console.log("Logo:", logoFile);
          // console.log("Banner:", bannerFile.name);
          
          alert("Business updated successfully!");
        } catch (error) {
          console.error("Failed to update business:", error);
          alert("Failed to update business.");
        } finally {
          setSaving(false);
        }
      };

    if (loading) {
        return (
        <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex flex-col items-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />

            <p className="mt-4 text-sm text-gray-500">
                Loading business...
            </p>
            </div>
        </div>
        );
    }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <button
                onClick={() => window.history.back()}
                className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft size={19} />
              </button>

              <div>
                <p className="text-xs text-gray-500">
                  Products
                </p>

                <h1 className="text-xl font-bold text-gray-900">
                  Edit Product
                </h1>
              </div>

            </div>

            <div className="hidden gap-3 sm:flex">

              {/* <button className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium hover:bg-gray-50">
                <Eye size={17} />
                Preview
              </button> */}

              <button 
                type="submit"
                form="product-form"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800">
                <Save size={17} />
                {saving? "Saving..." : "Save Changes"}
              </button>

            </div>

          </div>

        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <form
            id="product-form"
            onSubmit={handleSubmit}
        >
            <div className="grid gap-6 lg:grid-cols-3">

            {/* ================= LEFT ================= */}
            <div className="space-y-6 lg:col-span-2">

                {/* Basic Information */}
                <section className="rounded-xl border bg-white p-6">

                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900">
                    Basic Information
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                    Provide the main information about your product.
                    </p>
                </div>

                <div className="space-y-5">

                    {/* Product name */}
                    <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Product Name
                    </label>

                    <input
                        type="text"
                        name="name"
                        value={product[0]?.name}
                        onChange={handleChange}
                        placeholder="Enter product name"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                        required
                    />
                    </div>

                    {/* Description */}
                    <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Description
                    </label>

                    <textarea
                        name="description"
                        value={product[0]?.description}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Describe your product...."
                        className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />
                    </div>

                    {/* Category + Brand */}
                    <div className="grid gap-5 sm:grid-cols-2">

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Category
                        </label>

                        <select
                            name="category"
                            value={product[0]?.category}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900"
                        >
                        <option value="">Selected Category</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Part time Classes">Part time Classes</option>
                        </select>
                    </div>

                    <div>
                        {/* <label className="mb-2 block text-sm font-medium text-gray-700">
                        Brand
                        </label>

                        <input
                        type="text"
                        defaultValue="Premium Wear"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                        /> */}
                    </div>

                    </div>

                </div>

                </section>

                {/* Product Images */}
                <section className="rounded-xl border bg-white p-6">

                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900">
                    Product Image
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                    Add clear image of your product.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">

                    
                    <div
                    
                        className="group relative aspect-square overflow-hidden rounded-lg border bg-gray-100"
                    >

                        <img
                        src="../../iphone2.jpg"
                        //   alt={`Product ${index + 1}`}
                        className="h-full w-full object-cover"
                        />

                        

                    </div>
                    
                    {/* Upload */}
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-gray-900 hover:bg-gray-100">

                    <Upload
                        size={24}
                        className="text-gray-400"
                    />

                    <span className="mt-2 text-xs font-medium text-gray-600">
                        Add Image
                    </span>

                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                    />

                    </label>

                </div>

                <p className="mt-4 text-xs text-gray-400">
                    Recommended: JPG or PNG, maximum 5MB per image.
                </p>

                </section>

                {/* Pricing */}
                <section className="rounded-xl border bg-white p-6">

                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900">
                    Pricing
                    </h2>
                </div>

                <div className="grid gap-5 sm:grid-cols-3">

                    <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Selling Price
                    </label>

                    <div className="flex rounded-lg border border-gray-300">
                        <span className="flex items-center border-r bg-gray-50 px-3 text-xs text-gray-500">
                        MWK
                        </span>

                        <input
                        name="price"
                        type="number"
                        value={product[0]?.price}
                        onChange={handleChange}
                        className="w-full px-3 py-3 text-sm outline-none"
                        />
                    </div>
                    </div>

                    <div>
                    {/* <label className="mb-2 block text-sm font-medium text-gray-700">
                        Compare at Price
                    </label>

                    <div className="flex rounded-lg border border-gray-300">
                        <span className="flex items-center border-r bg-gray-50 px-3 text-xs text-gray-500">
                        MWK
                        </span>

                        <input
                        type="number"
                        defaultValue="30000"
                        className="w-full px-3 py-3 text-sm outline-none"
                        />
                    </div> */}
                    </div>

                    <div>
                    {/* <label className="mb-2 block text-sm font-medium text-gray-700">
                        SKU
                    </label>

                    <input
                        type="text"
                        defaultValue="TSH-001"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none"
                    /> */}
                    </div>

                </div>

                </section>

                {/* Inventory */}
                <section className="rounded-xl border bg-white p-6">

                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900">
                    Inventory
                    </h2>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">

                    <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Stock Quantity
                    </label>

                    <input
                        name="quantity"
                        type="number"
                        value={product[0]?.quantity}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none"
                    />
                    </div>

                    <div>
                    {/* <label className="mb-2 block text-sm font-medium text-gray-700">
                        Low Stock Alert
                    </label>

                    <input
                        type="number"
                        defaultValue="5"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none"
                    /> */}
                    </div>

                </div>

                </section>

                {/* Variants */}
                {/* <section className="rounded-xl border bg-white p-6"> */}

                {/* <div className="mb-6 flex items-center justify-between">

                    <div>
                    <h2 className="text-lg font-bold text-gray-900">
                        Product Options
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage available colors and sizes.
                    </p>
                    </div>

                </div> */}

                {/* Colors */}
                {/* <div>
                    <label className="mb-3 block text-sm font-semibold">
                    Colors
                    </label>

                    <div className="flex flex-wrap gap-2">

                    {colors.map((color, index) => (
                        <div
                        key={color}
                        className="flex items-center gap-2 rounded-lg border bg-gray-50 px-3 py-2 text-sm"
                        >
                        {color}

                        <button
                            onClick={() => removeColor(index)}
                            className="text-gray-400 hover:text-red-500"
                        >
                            <X size={14} />
                        </button>
                        </div>
                    ))}

                    <button className="flex items-center gap-1 rounded-lg border border-dashed px-3 py-2 text-sm text-gray-500 hover:border-gray-900 hover:text-gray-900">
                        <Plus size={15} />
                        Add Color
                    </button>

                    </div>
                </div> */}

                {/* Sizes */}
                {/* <div className="mt-6">

                    <label className="mb-3 block text-sm font-semibold">
                    Sizes
                    </label>

                    <div className="flex flex-wrap gap-2">

                    {sizes.map((size, index) => (
                        <div
                        key={size}
                        className="flex items-center gap-2 rounded-lg border bg-gray-50 px-4 py-2 text-sm"
                        >
                        {size}

                        <button
                            onClick={() => removeSize(index)}
                            className="text-gray-400 hover:text-red-500"
                        >
                            <X size={14} />
                        </button>
                        </div>
                    ))}

                    <button className="flex items-center gap-1 rounded-lg border border-dashed px-3 py-2 text-sm text-gray-500 hover:border-gray-900 hover:text-gray-900">
                        <Plus size={15} />
                        Add Size
                    </button>

                    </div>

                </div> */}

                {/* </section> */}

            </div>

            {/* ================= RIGHT ================= */}
            <div className="space-y-6">

                {/* Status */}
                <section className="rounded-xl border bg-white p-6">

                <h2 className="font-bold text-gray-900">
                    Product Status
                </h2>

                <select
                    value={product[0]?.status}
                    className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none"
                >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                </select>

                </section>

                {/* Preview */}
                <section className="overflow-hidden rounded-xl border bg-white">

                <div className="border-b px-5 py-4">
                    <h2 className="font-bold text-gray-900">
                    Product Preview
                    </h2>
                </div>

                <div className="p-5">

                    <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                    <img
                        src="../../iphone2.jpg"
                        // alt={product.name}
                        className="h-full w-full object-cover"
                    />
                    </div>

                    <h3 className="mt-4 font-semibold text-gray-900">
                    {product[0]?.name}
                    </h3>

                    <p className="mt-2 text-lg font-bold">
                    MWK {product[0]?.price}
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                    {product[0]?.category}
                    </p>

                </div>

                </section>

                {/* Delete */}
                <section className="rounded-xl border border-red-100 bg-white p-6">

                <h2 className="font-bold text-gray-900">
                    Delete Product
                </h2>

                <p className="mt-2 text-sm leading-5 text-gray-500">
                    Permanently remove this product from your store.
                    This action cannot be undone.
                </p>

                <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
                    <Trash2 size={16} />
                    Delete Product
                </button>

                </section>

            </div>

            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

          </div>
            {/* Mobile Save */}
            <div className="mt-6 flex gap-3 sm:hidden">

            <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border bg-white px-4 py-3 text-sm font-medium">
                <Eye size={17} />
                Preview
            </button>

            <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white">
                <Save size={17} />
                Save
            </button>

            </div>
        </form>
      </main>
    </div>
  );
}

const ProductDetailsPage = () => {
    return (
        <PageContainer title="Product Details">
            <ProductDetails />
        </PageContainer>
    );
};

export default ProductDetailsPage;