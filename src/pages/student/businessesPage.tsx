import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageContainer from "../../components/layout/PageContainer";
import { useAuth } from "../../context/useAuth";

import { getAllBusinessesApi } from "@/api/businessApi";
import { getErrorMessage } from "@/api/client";
import type { Business } from "../../types";


// ─── Main Page (Updated with comprehensive error handling) ─────────────────────────────────────────────────
const ProductsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [fetchError, setFetchError] = useState("");

   const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      if (!user?._id) {
        return;
      }
      const data = await getAllBusinessesApi();
      const visible =
        user?.role === "admin"
          ? data
          : data.filter((j) => j.status === "approved");
      setBusinesses(visible);
    } catch (err) {
      console.error("Failed to fetch Businesses:", err);
      setFetchError(
        getErrorMessage(err, "Failed to load Businesses. Please try again later."),
      );
    } finally {
      setLoading(false);
    }
  }, [user?._id, user?.role]);

   useEffect(() => {
    void fetchBusinesses();
  }, [fetchBusinesses]);

  

   const filtered = businesses.filter((j) => {
    const matchSearch =
      j.name.toLowerCase().includes(search.toLowerCase()) ||
      j.category.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType ? j.category === filterType : true;
    return matchSearch && matchType;
  });

  return (
    <PageContainer title="Store">
      {/* Header */}
      {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Products
          <span className="text-sm text-gray-500 mt-0.5">
            (3)
            
          </span>
          </h2>
        </div>
       
      </div> */}

      {/* Notifications */}
      
      {fetchError && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
          <span>{fetchError}</span>
          <button
            onClick={() => {
              setFetchError("");
              fetchBusinesses();
            }}
            className="text-yellow-600 hover:text-yellow-800 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search business..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e]"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e] bg-white"
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Part time Classes">Part time Classes</option>
          {/* <option value="internship">Internship</option> */}
          {/* <option value="remote">Remote</option> */}
        </select>
      </div>

      {/* Job Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">
            {search || filterType
              ? "No Businesses found matching your search."
              : "No Businesses available at the moment."}
          </p>
          {(search || filterType) && (
            <button
              onClick={() => {
                setSearch("");
                setFilterType("");
              }}
              className="mt-2 text-sm text-[#1e3a6e] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="">
          
          <div className="">

            <div className="overflow-x-auto">

              {/* <table className="w-full min-w-[900px] border-collapse">

                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">

                    <th className="px-5 py-4">
                      Product
                    </th>

                    <th className="px-5 py-4">
                      Category
                    </th>

                    <th className="px-5 py-4">
                      Seller
                    </th>

                    <th className="px-5 py-4">
                      Price
                    </th>

                    <th className="px-5 py-4">
                      Rating
                    </th>

                    <th className="px-5 py-4">
                      Availability
                    </th>

                    <th className="px-5 py-4 text-right">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y">

                  {filtered.map((product) => {

                    const discount = product.oldPrice
                      ? Math.round(
                          ((product.oldPrice -
                            product.price) /
                            product.oldPrice) *
                            100
                        )
                      : null;

                    return (
                      <tr
                        key={product._id}
                        className="group transition hover:bg-gray-50"
                      >

                        Product
                        <td className="px-5 py-4">

                          <div className="flex items-center gap-4">

                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">

                              {discount && (
                                <span className="absolute left-1 top-1 z-10 rounded bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                                  -{discount}%
                                </span>
                              )}

                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />

                            </div>

                            <div>
                              <p className="font-semibold text-gray-900">
                                {product.name}
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                Product #{product._id}
                              </p>
                            </div>

                          </div>

                        </td>

                        Category
                        <td className="px-5 py-4">

                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            {product.category}
                          </span>

                        </td>

                        Seller
                        <td className="px-5 py-4">

                          <p className="text-sm font-medium text-gray-900">
                            {product.vendor}
                          </p>

                        </td>

                        Price
                        <td className="px-5 py-4">

                          <div>
                            <p className="font-bold text-gray-900">
                              {product.price}
                            </p>

                            {product.oldPrice && (
                              <p className="text-xs text-gray-400 line-through">
                                {formatPrice(product.oldPrice)}
                              </p>
                            )}
                          </div>

                        </td>

                        Rating
                        <td className="px-5 py-4">

                          <div className="flex items-center gap-1">

                            <Star
                              size={15}
                              className="fill-yellow-400 text-yellow-400"
                            />

                            <span className="text-sm font-semibold">
                              {product.rating}
                            </span>

                            <span className="text-xs text-gray-400">
                              ({product.reviews})
                            </span>

                          </div>

                        </td>

                        Stock
                        <td className="px-5 py-4">

                          {product.quantity > 0 ? (
                            <div>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                Available
                              </span>

                              <p className="mt-1 text-xs text-gray-400">
                                {product.quantity} left
                              </p>
                            </div>
                          ) : (
                            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                              Out of stock
                            </span>
                          )}

                        </td>

                        Action
                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              onClick={() => navigate(`/alumni/product_details/${product._id}`)}
                              title="details"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border bg-white hover:bg-gray-100"
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              className="flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800"
                            >
                              <MessageCircle size={15} />
                              WhatsApp
                            </button>

                          </div>

                        </td>

                      </tr>
                      
                    );
                  })}

                </tbody>

              </table> */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 hover:cursor-pointer">
                 {filtered.map((business) => {
                    return (
                <div 
                    onClick={() => navigate(`/student/business_details/${business._id}`)}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-tranform duration-300 ease-out hover:shadow-lg">
                      <img src="../../banner3.jpg" alt="" />
                    {/* <div className="h-52 bg-gray-200 sm:h-60">
                    
                        <div className="flex h-full items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600">
                        <div className="text-center text-white">
                            <p className="text-sm font-semibold">
                            {business.contact_email}
                            </p>

                            <p className="text-sm opacity-80">
                            0{business.contact_phone}
                            </p>
                        </div>
                        </div>
                    

                   
                    </div> */}

                    <div className="relative px-6 pb-6">
                    <div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end">

                        <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg">
                        
                            <div className="flex h-full w-full items-center justify-center bg-gray-100">
                            <svg
                                className="h-12 w-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4-4a3 3 0 014 0l4 4m-8-8h.01M20 20H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2z"
                                />
                            </svg>
                            </div>
                        
                        </div>

                        <div className="flex-1 pb-1">
                        {/* <h2 className="text-xl font-bold text-gray-900">
                            {business.name}
                        </h2> */}

                        <p className="text-sm text-gray-500">
                            {/* {business[0].category || "Business category"} */}
                        </p>
                        </div>
                    </div>

                    <p className="mt-4 text-xs text-gray-500">
                        {business.name}
                    </p>
                    <p className="text-sm text-gray-500">
                        {business.category || "Business category"}
                    </p>
                    </div>
                </div>
                      );
                  })}
              </div>
            </div>

          </div>
        </div>
            
      )}

     
    </PageContainer>
  );
};

export default ProductsPage;
