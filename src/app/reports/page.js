"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [field, setField] = useState(searchParams.get("field") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = useState(Number(searchParams.get("limit")) || 9);

  const [filterOptions, setFilterOptions] = useState({});
  const [totalPages, setTotalPages] = useState(1);

  const fetchReports = async (search, field, page, limit) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        field,
        page: page.toString(),
        limit: limit.toString(),
      }).toString();

      const response = await fetch(`/api/reports?${query}`);
      const data = await response.json();

      if (data.data) {
        setReports(data.data);
        setTotalPages(data.pagination.totalPages);
        setFilterOptions(data.filterOptions);
        setError(null);
      } else {
        if (data.error === "Unauthorized") {
          setError("Unauthorized, please login first");
          router.push("/login");
        } else {
          setError(data.message);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateQueryParams = (params) => {
    const updatedParams = {
      search: searchTerm,
      field,
      page,
      limit,
      ...params,
    };

    const query = new URLSearchParams({
      search: updatedParams.search || "",
      field: updatedParams.field || "",
      page: updatedParams.page.toString(),
      limit: updatedParams.limit.toString(),
    }).toString();

    router.replace(`/reports?${query}`);
    setSearchTerm(updatedParams.search);
    setField(updatedParams.field);
    setPage(updatedParams.page);
    setLimit(updatedParams.limit);
  };

  const handleSearch = () => {
    updateQueryParams({ search: searchTerm, page: 1 });
    fetchReports(searchTerm, field, 1, limit);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    fetchReports(searchTerm, field, page, limit);
  }, [field, page]);

  if (loading) {
    return (
      <main className="p-6 bg-base-100 text-base-content text-center">
        <h1 className="text-4xl font-bold">Loading Reports...</h1>
      </main>
    );
  }

  return (
    <main className="p-6 bg-base-100 text-center flex flex-col items-center">
      <h1 className="text-4xl font-bold">Reports</h1>

      <div className="flex flex-col gap-4 mt-6 w-full max-w-lg">
        {/* Search Input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search reports..."
            className="input input-bordered w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="btn btn-accent" onClick={handleSearch}>
            Search
          </button>
        </div>

        {/* Filter Select */}
        {filterOptions.field && (
          <select
            className="select select-bordered w-full"
            value={field || ""}
            onChange={(e) => {
              const value = e.target.value;
              updateQueryParams({ field: value || "", page: 1 });
              fetchReports(searchTerm, value || "", 1, limit);
            }}
          >
            <option value="">All Fields</option>
            {filterOptions.field.map((fieldOption) => (
              <option key={fieldOption} value={fieldOption}>
                {fieldOption}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && (
        <div className="p-6 bg-base-100 text-base-content text-center">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      <button
        className="btn btn-accent mt-4"
        onClick={() => router.push("/reports/create")}
      >
        Create New Report
      </button>

      {reports.length > 0 ? (
        <>
          <div className="mt-4 grid gap-6 justify-center mx-auto max-w-screen-xl grid-cols-1 sm:grid-cols-2 md:grid-cols-3 justify-items-center">
            {reports.length === 1 && <div></div>}
            {reports.map((report) => (
              <div
                key={report._id}
                className="bg-accent text-accent-content p-6 rounded-lg shadow-md flex flex-col h-full"
              >
                <div className="flex flex-col flex-grow">
                  <h2 className="text-xl font-bold line-clamp-2">
                    {report.subject}
                  </h2>
                  <h4 className="text-md italic line-clamp-1">
                    {report.areaOfReport}
                  </h4>
                  <p className="mt-2 text-sm">{report.field}</p>
                  <span className="mt-2 text-sm text-gray-500">
                    Created on:{" "}
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-4">
                  <button
                    className="w-full btn btn-info hover:btn-secondary transition-all"
                    onClick={() => router.push(`/reports/${report._id}`)}
                  >
                    See Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex gap-4 justify-center items-center">
            <button
              className="btn btn-secondary"
              onClick={() => updateQueryParams({ page: Math.max(page - 1, 1) })}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="text-lg">
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-secondary"
              onClick={() =>
                updateQueryParams({ page: Math.min(page + 1, totalPages) })
              }
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p className="mt-4">No reports available.</p>
      )}
    </main>
  );
}
