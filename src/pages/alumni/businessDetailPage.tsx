import React, { useCallback, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getBusinessApi, updateBusinessApi } from "@/api/businessApi";
import type { Business } from "../../types";
import PageContainer from "../../components/layout/PageContainer";

export interface BusinessFormData {
  name: string;
  location: string;
  category: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  logo: string;
  banner: string;
}

const BusinessDetail = () => {
  const [business, setBusiness] = useState<Business[]>([]);

  const [logoPreview, setLogoPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { business_id } = useParams();

  const loadBusiness = useCallback(async () => {
    setLoading(true);
    try {
      if (business_id) {
        const data = await getBusinessApi(business_id);
        setBusiness(data);
      }
    } catch (error) {
      console.error("Failed to load business:", error);
    } finally {
      setLoading(false);
    }
  }, [business_id]);

  useEffect(() => {
    void loadBusiness();
  }, [loadBusiness]);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {

    const { name, value } = e.target;
    console.log('fired', name, value, e.target.value);

    setBusiness((prev) => {
      return [{
        ...prev[0], [name]: value
      }];
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const logo = e.target.files?.[0];

    if (!logo) return;

    setLogoFile(logo);
    setLogoPreview(URL.createObjectURL(logo));
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const banner = e.target.files?.[0];
    console.log(banner);
    if (!banner) return;

    setBannerFile(banner);
    setBannerPreview(URL.createObjectURL(banner));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);

    try {
      
       const data = new FormData();
       
        data.append("name", business[0].name);
        data.append("location", business[0].location);
        data.append("category", business[0].category);
        data.append("description", business[0].description);
        data.append("contact_email", business[0].contact_email);
        data.append("contact_phone", business[0].contact_phone);

        if (logoFile) {
          data.append("logo", logoFile);
        }
        if (bannerFile) {
          data.append("banner", bannerFile);
        }
        console.log('form data', data);
        if (business_id && data){
          await updateBusinessApi(business[0]._id, data);
        }
      console.log(data);

      console.log("Business data:", business);
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
    
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Business Details
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Update your business information and branding.
            </p>
          </div>

          <button
            type="submit"
            form="business-form"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <form
          id="business-form"
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* BRANDING */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            {/* Banner */}
            <div className="relative h-56 bg-gray-200 sm:h-64">
              {bannerPreview ? (
                <img
                  src={bannerPreview}
                  alt="Business banner"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600">
                  <img src="../../banner3.jpg" alt="" className="object-cover"/>
                  {/* <div className="text-center text-white">
                    <p className="text-lg font-semibold">
                      Business Banner
                    </p>

                    <p className="text-sm opacity-80">
                      Upload a banner image
                    </p>
                  </div> */}
                  {/* <img src="../../banner3.jpg" alt="" /> */}
                </div>
              )}

              <label htmlFor="banner" className="absolute bottom-4 z-20 right-4 cursor-pointer rounded-lg bg-white/95 px-4 py-2 text-sm font-medium text-gray-700 shadow-md backdrop-blur transition hover:bg-white">
                Change Banner

                <input
                  id="banner"
                  name="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Logo */}
            <div className="relative px-6 pb-6">
              <div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end">

                <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Business logo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
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
                  )}
                </div>

                <div className="flex-1 pb-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {business[0].name}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {business[0].category || "Business category"}
                  </p>
                </div>

                <label className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                  Change Logo

                  <input
                    id="logo"
                    name="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* <p className="mt-4 text-xs text-gray-400">
                Recommended: Logo 500 × 500px. Banner 1600 × 600px.
              </p> */}
            </div>
          </div>

          {/* BASIC INFORMATION */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Tell customers about your business.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Business Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={business[0].name}
                  onChange={handleChange}
                  placeholder="Enter business name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category
                </label>

                <select
                  name="category"
                  value={business[0].category}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">Select category</option>
                  <option value="Technology">Technology</option>
                  <option value="Education">Education</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={business[0].description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe your business..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Give customers a brief description of what your business
                  offers.
                </p>
              </div>
            </div>
          </div>

          {/* CONTACT INFORMATION */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Contact Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                How customers can get in touch with your business.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={business[0].contact_phone}
                  onChange={handleChange}
                  placeholder="+265..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={business[0].contact_email}
                  onChange={handleChange}
                  placeholder="business@example.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Website
                </label>

                {/* <input
                  type="url"
                  name="website"
                  value={business.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                /> */}
              </div>
            </div>
          </div>

          {/* LOCATION */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Business Location
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Add your business location so customers can find you.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

              <div className="md:col-span-3">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={business[0].location}
                  onChange={handleChange}
                  placeholder="Street / Area / Trading Centre"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                {/* <label className="mb-2 block text-sm font-medium text-gray-700">
                  City
                </label> */}

                {/* <input
                  type="text"
                  name="city"
                  value={business.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                /> */}
              </div>

              <div>
                {/* <label className="mb-2 block text-sm font-medium text-gray-700">
                  District
                </label> */}

                {/* <input
                  type="text"
                  name="district"
                  value={business.district}
                  onChange={handleChange}
                  placeholder="District"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                /> */}
              </div>
            </div>
          </div>

          {/* ACTIONS */}
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

        </form>
      </div>
    </div>
  );
};


const BusinessDetailPage = () => {
//   const { user } = useAuth();
  return (
    <PageContainer title="Business Details">
      <BusinessDetail/>
    </PageContainer>
  );
};

export default BusinessDetailPage;