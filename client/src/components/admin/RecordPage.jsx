import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllRecordsForAdmin,
  deleteRecord,
  updateRecord,
  resetRecordState,
} from "../../store/slices/recordsSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RecordPage = () => {
  const dispatch = useDispatch();
  const { records, loading, error, message } = useSelector(
    (state) => state.records
  );

  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => {
    dispatch(fetchAllRecordsForAdmin());
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(resetRecordState());
      setEditingRecord(null);
      dispatch(fetchAllRecordsForAdmin());
    }
    if (error) {
      toast.error(error);
      dispatch(resetRecordState());
    }
  }, [message, error, dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      dispatch(deleteRecord(id));
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setForm({
      courtStation: record.courtStation || "",
      causeNo: record.causeNo || "",
      nameOfDeceased: record.nameOfDeceased || "",
      statusAtGP: record.statusAtGP || "Pending",
      volumeNo: record.volumeNo || "",
      datePublished: record.datePublished
        ? record.datePublished.substring(0, 10)
        : "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    dispatch(updateRecord({ id: editingRecord._id, recordData: form }));
  };

  const columns = [
    { key: "index", label: "No." },
    { key: "courtStation", label: "Court Station" },
    { key: "causeNo", label: "Cause No." },
    { key: "nameOfDeceased", label: "Name of Deceased" },
    { key: "statusAtGP", label: "Status at G.P" },
    { key: "volumeNo", label: "Volume No." },
    {
      key: "datePublished",
      label: "Date Published",
      render: (val) => (val ? new Date(val).toLocaleDateString() : "-"),
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded shadow">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        📄 All Records (Admin)
      </h2>

      {/* ===== Records Table ===== */}
      {loading ? (
        <p className="text-gray-500 text-center">Loading records...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="border p-2 text-left">
                    {col.label}
                  </th>
                ))}
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((r, idx) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    {columns.map((col) => (
                      <td key={col.key} className="border p-2">
                        {col.key === "index"
                          ? idx + 1
                          : col.render
                          ? col.render(r[col.key])
                          : r[col.key]}
                      </td>
                    ))}
                    <td className="border p-2 space-x-2">
                      <button
                        onClick={() => handleEdit(r)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="border p-4 text-center text-gray-500"
                  >
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== Inline Editing Form ===== */}
      {editingRecord && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h3 className="font-semibold mb-4">Edit Record</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <input
              type="text"
              name="courtStation"
              placeholder="Court Station"
              value={form.courtStation}
              onChange={handleChange}
              className="border p-2 w-full"
            />
            <input
              type="text"
              name="causeNo"
              placeholder="Cause No."
              value={form.causeNo}
              onChange={handleChange}
              className="border p-2 w-full"
            />
            <input
              type="text"
              name="nameOfDeceased"
              placeholder="Name of Deceased"
              value={form.nameOfDeceased}
              onChange={handleChange}
              className="border p-2 w-full"
            />
            <select
              name="statusAtGP"
              value={form.statusAtGP}
              onChange={handleChange}
              className="border p-2 w-full"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Published">Published</option>
            </select>
            <input
              type="text"
              name="volumeNo"
              placeholder="Volume No."
              value={form.volumeNo}
              onChange={handleChange}
              className="border p-2 w-full"
            />
            <input
              type="date"
              name="datePublished"
              value={form.datePublished}
              onChange={handleChange}
              className="border p-2 w-full"
            />
            <div className="space-x-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RecordPage;
