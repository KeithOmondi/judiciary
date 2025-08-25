import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { bulkUploadRecords, fetchBulkRecords, resetBulkState } from "../../store/slices/bulkSlice";

const BulkUpload = () => {
  const dispatch = useDispatch();
  const { records, loading, message, error } = useSelector((state) => state.bulk);

  const [pdfFiles, setPdfFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Fetch bulk records on mount
  useEffect(() => {
    dispatch(fetchBulkRecords());
  }, [dispatch]);

  // Toast notifications
  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(resetBulkState());
      setPdfFiles([]);
      setUploading(false);
    }
    if (error) {
      toast.error(error);
      dispatch(resetBulkState());
      setUploading(false);
    }
  }, [message, error, dispatch]);

  const handleFileChange = (e) => setPdfFiles(Array.from(e.target.files));

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (pdfFiles.length === 0) return toast.error("Please select PDF files");

    setUploading(true);
    const formData = new FormData();
    pdfFiles.forEach((file) => formData.append("files", file));

    await dispatch(bulkUploadRecords(formData));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded shadow">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2 className="text-2xl font-bold mb-6 text-gray-800">📄 Bulk Upload Records</h2>

      <form onSubmit={handleBulkUpload} className="mb-6 p-4 border rounded bg-gray-50 space-y-4">
        <input type="file" accept="application/pdf" multiple onChange={handleFileChange} className="border p-2 rounded w-full" />

        {pdfFiles.length > 0 && (
          <ul className="list-disc list-inside">
            {pdfFiles.map((file, idx) => (<li key={idx}>{file.name}</li>))}
          </ul>
        )}

        <button
          type="submit"
          disabled={uploading}
          className={`${uploading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"} text-white px-4 py-2 rounded`}
        >
          {uploading ? `Uploading ${pdfFiles.length} file(s)...` : "Upload All"}
        </button>
      </form>

      {loading ? <p>Loading records...</p> : (
        <table className="min-w-full border rounded-lg overflow-x-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">No.</th>
              <th className="border p-2 text-left">Court Station</th>
              <th className="border p-2 text-left">Cause No.</th>
              <th className="border p-2 text-left">Name of Deceased</th>
              <th className="border p-2 text-left">Volume No.</th>
              <th className="border p-2 text-left">Date Published</th>
            </tr>
          </thead>
          <tbody>
            {records.length > 0 ? records.map((r, idx) => (
              <tr key={r._id} className="hover:bg-gray-50">
                <td className="border p-2">{idx + 1}</td>
                <td className="border p-2">{r.courtStation}</td>
                <td className="border p-2">{r.causeNo}</td>
                <td className="border p-2">{r.nameOfDeceased}</td>
                <td className="border p-2">{r.volumeNo}</td>
                <td className="border p-2">{r.datePublished ? new Date(r.datePublished).toLocaleDateString() : "-"}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="border p-4 text-center text-gray-500">No records found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BulkUpload;
