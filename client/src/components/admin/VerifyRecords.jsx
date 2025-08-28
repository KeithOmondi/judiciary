import React, { useState } from "react";
import axios from "axios";

const VerifyRecords = () => {
  const [excelFile, setExcelFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!excelFile || !pdfFile) {
      setError("Please upload both Excel and PDF files.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("excel", excelFile);
      formData.append("pdf", pdfFile);

      const res = await axios.post(
        "http://localhost:8000/api/v1/records/verify",
        formData,
        { withCredentials: true }
      );

      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const renderTable = (records, color, title) => (
    <div className="mb-8">
      <h3 className={`text-xl font-semibold ${color} mb-2`}>
        {title} ({records.length})
      </h3>
      {records.length === 0 ? (
        <p className="text-gray-500">No records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Cause No.</th>
                <th className="border p-2">Name of Deceased</th>
                <th className="border p-2">Court Station</th>
                <th className="border p-2">Date Published</th>
                <th className="border p-2">Status @ G.P</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i} className="bg-white even:bg-gray-50">
                  <td className="border p-2">{r.causeNo || "-"}</td>
                  <td className="border p-2">{r.nameOfDeceased || "-"}</td>
                  <td className="border p-2">{r.courtStation || "-"}</td>
                  <td className="border p-2">{r.datePublished || results?.datePublished || "-"}</td>
                  <td className="border p-2">{r.statusAtGP || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
        📑 Verify Gazette Records
      </h2>

      {/* Upload Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-4 mb-8"
      >
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => setExcelFile(e.target.files[0])}
          className="p-2 border rounded-lg"
        />
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdfFile(e.target.files[0])}
          className="p-2 border rounded-lg"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify Records"}
        </button>
      </form>

      {error && <p className="text-red-500 text-center mb-4">❌ {error}</p>}

      {/* Results */}
      {results && (
        <div className="space-y-8">
          {renderTable(results.matched, "text-green-700", "✅ Matched Records")}
          {renderTable(results.onlyExcel, "text-blue-700", "📄 Only in Excel")}
          {renderTable(results.onlyPdf, "text-red-700", "📑 Only in PDF")}
        </div>
      )}
    </div>
  );
};

export default VerifyRecords;
