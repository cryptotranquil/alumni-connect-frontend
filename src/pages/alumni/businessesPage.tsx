import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageContainer from "../../components/layout/PageContainer";
import { useAuth } from "../../context/AuthContext";

import { createBusinessApi, getMyBusinessesApi } from "@/api/businessApi";
import type { Business } from "../../types";

export interface BusinessFormData {
  name: string;
  location: string;
  category: string;
  description: string;
  contact_email: string;
  contact_phone: string;
}

export interface PostBusinessModalProps {
  onClose: () => void;
  onSubmit: (form: BusinessFormData) => void;
  submitting: boolean;
  error: string;
  isAdmin?: boolean;
  editBusiness?: Business | null;
}

// ─── Validation Function ──────────────────────────────────────────────────────────
const validateBusinessForm = (
  form: BusinessFormData,
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Title validation
  if (!form.name.trim()) {
    errors.name = "Business name is required";
  } else if (form.name.trim().length < 3) {
    errors.name = "Business name must be at least 3 characters";
  } else if (form.name.trim().length > 100) {
    errors.name = "Business name must be less than 100 characters";
  }

  // Company validation
  if (!form.location.trim()) {
    errors.location = "Location name is required";
  } else if (form.location.trim().length >= 5) {
    errors.location = "Location name must be at least 5 characters";
  }

  // Location validation (optional but validate if provided)
  if (form.category.trim() && form.category.trim().length > 20) {
    errors.category = "Category must be less than 20 characters";
  }

  // Description validation
  if (!form.description.trim()) {
    errors.description = "Job description is required";
  } else if (form.description.trim().length < 20) {
    errors.description = "Job description must be at least 20 characters";
  } else if (form.description.trim().length > 5000) {
    errors.description = "Job description must be less than 5000 characters";
  }

  // Type validation
  // const validTypes = ["full-time", "part-time", "internship", "remote"];
  // if (!form.type || !validTypes.includes(form.type)) {
  //   errors.type = "Please select a valid job type";
  // }

  // Requirements validation (optional)
  // if (form.requirements.trim()) {
  //   const reqs = form.requirements
  //     .split(",")
  //     .map((r) => r.trim())
  //     .filter(Boolean);
  //   if (reqs.length > 20) {
  //     errors.requirements = "Maximum 20 requirements allowed";
  //   }
  //   reqs.forEach((req, idx) => {
  //     if (req.length > 100) {
  //       errors.requirements = `Requirement ${idx + 1} exceeds 100 characters`;
  //     }
  //   });
  // }

  // Salary validation (optional but validate format if provided)
  if (form.contact_phone.trim()) {
    if (form.contact_phone.trim().length >= 10) {
      errors.salary = "Contact Phone information is too long";
    }
  }

  // Deadline validation
  // if (form.deadline) {
  //   const deadlineDate = new Date(form.deadline);
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);

  //   if (isNaN(deadlineDate.getTime())) {
  //     errors.deadline = "Invalid date format";
  //   } else if (deadlineDate < today) {
  //     errors.deadline = "Deadline cannot be in the past";
  //   }
  // }

  // Email validation
  if (form.contact_email.trim()) {
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(form.contact_email.trim())) {
      errors.contactEmail = "Please enter a valid email address";
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

// ─── Job Detail Modal ──────────────────────────────────────────────────────────
export function BusinessDetailModal({
  business,
  onClose,
  userRole,
  onEdit,
}: {
  business: Business;
  onClose: () => void;
  userRole?: string;
  onEdit?: (business: Business) => void;
}) {
  
  const typeBadgeColor = (type?: string) => {
    if (type === "Technology") return "bg-orange-100 text-orange-700";
    if (type === "Education") return "bg-green-100 text-green-700";
    // if (type === "part-time") return "bg-purple-100 text-purple-700";
    return "bg-blue-100 text-[#1e3a6e]";
  };

  const canEdit =
    userRole === "alumni" ||
    (userRole === "alumni" && business.posted_by?.id === userRole);

  // const handleApply = async () => {
  //   setApplying(true);
  //   setApplyError("");
  //   try {
  //     await onApply(job._id);
  //     onClose();
  //   } catch (err: any) {
  //     setApplyError(err.message || "Failed to apply for this job");
  //   } finally {
  //     setApplying(false);
  //   }
  // };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="font-bold text-gray-900 text-lg leading-snug">
              {business.name}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">{business.location}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Badges row */}
          <div className="flex flex-wrap gap-2">
            {/* <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${typeBadgeColor(job.type)}`}
            >
              {job.type || "Full-time"}
            </span> */}
            {business.status === "pending" && (
              <span className="text-xs px-3 py-1 rounded-full font-medium bg-yellow-100 text-yellow-700">
                Pending Approval
              </span>
            )}
            {business.status === "inactive" && (
              <span className="text-xs px-3 py-1 rounded-full font-medium bg-red-100 text-red-700">
                Rejected
              </span>
            )}
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{business.location || "Not specified"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {/* <span>{business.posted_by?.name || "Alumni"}</span> */}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>
                {new Date(business.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            {/* {job.applicants && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg
                  className="w-4 h-4 text-gray-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>
                  {job.applicants.length} applicant
                  {job.applicants.length !== 1 ? "s" : ""}
                </span>
              </div>
            )} */}
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Job Description
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {business.description}
            </p>
          </div>

          {/* Requirements */}
          {/* {job.requirements && job.requirements.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Requirements
              </h4>
              <ul className="space-y-1.5">
                {job.requirements.map((req, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1e3a6e] flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )} */}

         
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-3">
          {canEdit && onEdit && (
            <button
              onClick={() => {
                onEdit(business);
                onClose();
              }}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              Edit Job
            </button>
          )}
          <button
            onClick={onClose}
            className={`${canEdit && onEdit ? "flex-1" : "flex-[2]"} border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors`}
          >
            Close
          </button>
          {/* {userRole === "student" && job.status === "approved" && (
            <button
              onClick={handleApply}
              disabled={applying}
              className="flex-1 bg-[#1e3a6e] hover:bg-[#162d57] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {applying ? "Applying..." : "Apply Now"}
            </button>
          )} */}
        </div>
      </div>
    </div>
  );
}

// ─── Post Job Modal (Updated with validation and error handling) ────────────────────────────────────────────
export function PostBusinessModal({
  onClose,
  onSubmit,
  submitting,
  error,
  isAdmin = false,
  editBusiness = null,
}: PostBusinessModalProps) {
  const [form, setForm] = useState<BusinessFormData>({
    name: editBusiness?.name || "",
    location: editBusiness?.location || "",
    category: editBusiness?.category || "",
    description: editBusiness?.description || "",
    contact_email: editBusiness?.contact_email || "",
    contact_phone: editBusiness?.contact_phone || "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Update form when editJob changes
  useEffect(() => {
    if (editBusiness) {
      setForm({
        name: editBusiness?.name || "",
        location: editBusiness?.location || "",
        category: editBusiness?.category || "",
        description: editBusiness?.description || "",
        
        contact_email: editBusiness?.contact_email || "",
        contact_phone: editBusiness?.contact_phone || "",
      });
      // Reset validation state when editing different job
      setFieldErrors({});
      setTouched({});
    }
  }, [editBusiness]);

  const set =
    (key: keyof BusinessFormData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const newValue = e.target.value;
      setForm((prev) => ({ ...prev, [key]: newValue }));

      // Clear field error when user starts typing
      if (fieldErrors[key]) {
        setFieldErrors((prev) => ({ ...prev, [key]: "" }));
      }
    };

  const handleBlur = (key: keyof BusinessFormData) => {
    setTouched((prev) => ({ ...prev, [key]: true }));

    // Validate on blur
    const validation = validateBusinessForm(form);
    if (validation.errors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: validation.errors[key] }));
    }
  };

  const handleSubmit = () => {
    // Mark all fields as touched
    console.log('btn clicked');
    const allTouched = Object.keys(form).reduce(
      (acc, key) => {
        acc[key as keyof BusinessFormData] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    );
    setTouched(allTouched);
    console.log(form);
    // Validate form
    const validation = validateBusinessForm(form);
        console.log(form);

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      // Scroll to first error
      console.log(validation.errors);
      const firstErrorField = Object.keys(validation.errors)[0];
      const errorElement = document.getElementById(`field-${firstErrorField}`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    console.log(form);

    onSubmit(form);
  };

  const isEditing = !!editBusiness;
  // console.log(business);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">
              {isEditing ? "Edit Business" : "Create a New Business"}
            </h3>
            {isAdmin && !isEditing && (
              <p className="text-xs text-green-600 mt-0.5 font-medium">
                ✓ As admin, this job will be published immediately
              </p>
            )}
            {isEditing && (
              <p className="text-xs text-blue-600 mt-0.5 font-medium">
                ✎ Editing existing business
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Title */}
          <div id="field-title">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Nova Intel"
              value={form.name}
              onChange={set("name")}
              onBlur={() => handleBlur("name")}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e] ${
                touched.name && fieldErrors.name
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
            />
            {touched.name && fieldErrors.name && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>
            )}
          </div>

          {/* Company + Location */}
          <div className="grid grid-cols-2 gap-3">
            <div id="field-category">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={set("category")}
                onBlur={() => handleBlur("category")}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e] bg-white ${
                  touched.type && fieldErrors.type
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300"
                }`}
              >
                <option value="Technology">Technology</option>
                <option value="Education">Education</option>
                {/* <option value="internship">Internship</option>
                <option value="remote">Remote</option> */}
              </select>
              {touched.type && fieldErrors.type && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.type}</p>
              )}
            </div>
            <div id="field-location">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. Blantyre, Remote"
                value={form.location}
                onChange={set("location")}
                onBlur={() => handleBlur("location")}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e] ${
                  touched.location && fieldErrors.location
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300"
                }`}
              />
              {touched.location && fieldErrors.location && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.location}
                </p>
              )}
            </div>
          </div>

          

          {/* Description */}
          <div id="field-description">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Business Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              value={form.description}
              onChange={set("description")}
              onBlur={() => handleBlur("description")}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e] resize-none ${
                touched.description && fieldErrors.description
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
            />
            {touched.description && fieldErrors.description && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.description}
              </p>
            )}
          </div>

          {/* Deadline + Contact Email */}
          <div className="grid grid-cols-2 gap-3">
             <div id="field-contact_email">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                placeholder="hr@company.com"
                value={form.contact_email}
                onChange={set("contact_email")}
                onBlur={() => handleBlur("contact_email")}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e] ${
                  touched.contact_email && fieldErrors.contact_email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300"
                }`}
              />
              {touched.contact_email && fieldErrors.contact_email && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.contact_email}
                </p>
              )}
            </div>
            <div id="field-contactEmail">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Contact Phone
              </label>
              <input
                type="phone"
                placeholder="+265 999 999 999"
                value={form.contact_phone}
                onChange={set("contact_phone")}
                onBlur={() => handleBlur("contact_phone")}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e] ${
                  touched.contact_phone && fieldErrors.contact_phone
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300"
                }`}
              />
              {touched.contact_phone && fieldErrors.contact_phone && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.contact_phone}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="flex-1 bg-[#1e3a6e] hover:bg-[#162d57] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting
                ? isEditing
                  ? "Updating..."
                  : "Posting..."
                : isEditing
                  ? "Update Business"
                  : isAdmin
                    ? "Publish Business"
                    : "Create Business"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page (Updated with comprehensive error handling) ─────────────────────────────────────────────────
const BusinessesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myBusinesses, setMyBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [error, setError] = useState("");
  const [postError, setPostError] = useState("");
  const [success, setSuccess] = useState("");
  const [fetchError, setFetchError] = useState("");

  const canPost =
    user?.role === "alumni" ||
    // user?.role === "student" ||
    user?.role === "admin";
  const fetchMyBusinesses = async () => {
    setLoading(true);
    setFetchError("");
    try {
      if (!user?._id){
        return;
      }
      const data = await getMyBusinessesApi();
      // console.log(user._id);
      const visible =
        user?.role === "admin"
          ? data
          : data.filter((j) => j.status === "approved");
      setMyBusinesses(visible);
    } catch (err: any) {
      console.error("Failed to fetch Businesses:", err);
      setFetchError(
        err.message || "Failed to load Businesses. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBusinesses();
  }, [user]);

  const fetchBusinesses = async () => {
    setLoading(true);
    setFetchError("");
    try {
      if (!user?._id){
        return;
      }
      const data = await getMyBusinessesApi();
      const visible =
        user?.role === "admin"
          ? data
          : data.filter((j) => j.status === "approved");
      setMyBusinesses(visible);
    } catch (err: any) {
      console.error("Failed to fetch businesses:", err);
      setFetchError(
        err.message || "Failed to load businesses. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [user]);

  const handleSubmit = async (form: BusinessFormData) => {
    // Validate form first
    const validation = validateBusinessForm(form);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      setPostError(firstError);
      return;
    }

    setSubmitting(true);
    setPostError("");

    try {
      const businessData = {
        name: form?.name || "",
        location: form?.location || "",
        category: form.category as Business['category'],
        description: form?.description || "",
       
        contact_email: form?.contact_email || "",
        contact_phone: form?.contact_phone || "",
      };

      if (editingBusiness) {
        // Update existing job
        // await updateBusinessApi(editingBusiness._id, businessData);
        // setSuccess("Job updated successfully!");
        // setEditingBusiness(null);
        console.log(businessData);
      } else {
        // Create new job
        console.log(businessData);
        await createBusinessApi(businessData);
        const msg =
          user?.role === "admin"
            ? "Job posted and published immediately."
            : "Job posted! It will appear after admin approval.";
        setSuccess(msg);
      }
      setShowBusinessModal(false);
      await fetchBusinesses(); // Refresh the job list
    } catch (err: any) {
      console.error("Job operation failed:", err);
      setPostError(
        err.message ||
          "Failed to save job. Please check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditBusiness = (business: Business) => {
    setEditingBusiness(business);
    setShowBusinessModal(true);
  };

  const filtered = myBusinesses.filter((j) => {
    const matchSearch =
      j.name.toLowerCase().includes(search.toLowerCase()) ||
      j.location.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType ? j.category === filterType : true;
    return matchSearch && matchType;
  });

  const categoryBadgeColor = (category?: string) => {
    if (category === "Technology") return "bg-orange-100 text-orange-700";
    if (category === "Education") return "bg-green-100 text-green-700";
    // if (category === "part-time") return "bg-purple-100 text-purple-700";
    return "bg-blue-100 text-[#1e3a6e]";
  };

  return (
    <PageContainer title="My Businesses">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Businesses
          <span className="text-sm text-gray-500 mt-0.5">
            (3)
            
          </span>
          </h2>
        </div>
        {canPost && (
          <button
            onClick={() => {
              setEditingBusiness(null);
              setPostError("");
              setShowBusinessModal(true);
            }}
            className="bg-[#1e3a6e] hover:bg-[#162d57] text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Business
          </button>
        )}
      </div>

      {/* Notifications */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
          <span>{success}</span>
          <button
            onClick={() => setSuccess("")}
            className="text-green-500 hover:text-green-700"
          >
            ✕
          </button>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-500">
            ✕
          </button>
        </div>
      )}
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
          <option value="Technology">Technology</option>
          <option value="Education">Education</option>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((business) => (
            <div
              key={business._id}
              onClick={() => setSelectedBusiness(business)}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#1e3a6e]/20 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1 pr-2">
                  <h3 className="font-semibold text-gray-900 text-base group-hover:text-[#1e3a6e] transition-colors">
                    {business.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">{business.location}</p>
                </div>
                {/* <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ml-2 ${typeBadgeColor(job.type)}`}
                >
                  {job.type || "Full-time"}
                </span> */}
              </div>

              <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {business.location || "Location not specified"}
              </div>

              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {business.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {/* Posted by {business.posted_by?.name || "Alumni"} */}
                </span>
                <span className="text-xs font-medium text-[#1e3a6e] group-hover:underline">
                   <button
                      onClick={() => navigate(`/alumni/business_details/${business._id}`)}
                    >
                      View Details
                    </button>
                  {/* <a href="http://localhost:5173/alumni/business_details">view</a>View details → */}
                </span>
              </div>

              {/* Admin-only status badge */}
              {user?.role === "admin" && business.status !== "approved" && (
                <div className="mt-3 pt-3 border-t border-gray-50">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                      business.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {business.status}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      

      {/* Post/Edit Job Modal */}
      {showBusinessModal && (
        <PostBusinessModal
          onClose={() => {
            setShowBusinessModal(false);
            setPostError("");
            setEditingBusiness(null);
          }}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={postError}
          isAdmin={user?.role === "admin"}
          editBusiness={editingBusiness}
        />
      )}
    </PageContainer>
  );
};

export default BusinessesPage;
