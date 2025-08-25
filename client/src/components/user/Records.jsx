import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRecords } from "../../store/slices/recordsSlice";

const Records = () => {
  const dispatch = useDispatch();
  const { records, loading, error } = useSelector((state) => state.records);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedRecord, setSelectedRecord] = useState(null); // For popup

  useEffect(() => {
    dispatch(fetchRecords());
  }, [dispatch]);

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.nameOfDeceased.toLowerCase().includes(search.toLowerCase()) ||
      r.causeNo.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ? true : r.statusAtGP === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) return <p className="p-4">Loading records...</p>;
  if (error) return <p className="p-4 text-red-500">❌ {error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
        📜 Available Records
      </h2>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search by Name or Cause No..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {filteredRecords.length === 0 ? (
        <p className="text-gray-500 text-center">No matching records found.</p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-2xl">
          <table className="min-w-full border-collapse">
            <thead className="bg-gradient-to-r from-blue-100 to-blue-200">
              <tr>
                <th className="border p-3 text-left">Court Station</th>
                <th className="border p-3 text-left">Cause No.</th>
                <th className="border p-3 text-left">Name of Deceased</th>
                <th className="border p-3 text-left">Status at G.P</th>
                <th className="border p-3 text-left">Volume No.</th>
                <th className="border p-3 text-left">Date Published</th>
                <th className="border p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r, idx) => (
                <tr
                  key={r._id}
                  className={`${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50 transition`}
                >
                  <td className="border p-3">{r.courtStation}</td>
                  <td className="border p-3">{r.causeNo}</td>
                  <td className="border p-3 font-semibold">
                    {r.nameOfDeceased}
                  </td>
                  <td
                    className={`border p-3 font-medium ${
                      r.statusAtGP === "Approved"
                        ? "text-green-600"
                        : r.statusAtGP === "Rejected"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {r.statusAtGP}
                  </td>
                  <td className="border p-3">{r.volumeNo}</td>
                  <td className="border p-3">
                    {r.datePublished
                      ? new Date(r.datePublished).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="border p-3 text-center">
                    {r.statusAtGP === "Rejected" && (
                      <button
                        onClick={() => setSelectedRecord(r)}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white w-96 rounded-lg shadow-lg p-6 relative">
            <h3 className="text-xl font-bold mb-4 text-red-600">
              ❌ Rejection Reason
            </h3>
            <p className="text-gray-700">
              {selectedRecord.rejectionReason || "No reason provided"}
            </p>
            <button
              onClick={() => setSelectedRecord(null)}
              className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Records;
