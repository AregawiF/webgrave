import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchMemorials = async ({ queryKey }) => {
  const [, filters] = queryKey;
  const { data } = await axios.get("http://localhost:5000/api/memorials", {
    params: filters,
  });
  return data;
};

export default function MyMemorials() {
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    isPublic: "",
    page: 1,
    limit: 10,
  });

  const { data, isLoading, error } = useQuery([
    "memorials",
    filters,
  ], fetchMemorials);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  if (isLoading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error fetching memorials</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Memorials</h1>
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleChange}
          placeholder="Search..."
          className="p-2 border rounded w-full"
        />
        <select name="status" value={filters.status} onChange={handleChange} className="p-2 border rounded">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select name="isPublic" value={filters.isPublic} onChange={handleChange} className="p-2 border rounded">
          <option value="">All</option>
          <option value="true">Public</option>
          <option value="false">Private</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.memorials.map((memorial) => (
          <div key={memorial._id} className="border rounded-lg p-4 shadow-lg">
            <img src={memorial.mainPicture} alt={memorial.fullName} className="w-full h-56 object-cover rounded" />
            <h2 className="text-xl font-semibold mt-4">{memorial.fullName}</h2>
            <p className="text-gray-600">{memorial.biography.substring(0, 100)}...</p>
            <p className="mt-2 text-sm text-gray-500">Born: {memorial.placeOfBirth}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-6 gap-4">
        <button
          onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
          disabled={filters.page === 1}
          className="p-2 border rounded bg-blue-500 text-white disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
          disabled={filters.page >= data.totalPages}
          className="p-2 border rounded bg-blue-500 text-white disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
