import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminStats, fetchBulkStats } from "../../store/slices/adminSlice";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const {
    totalRecords,
    approved,
    pending,
    recentRecords,
    totalCases,
    totalCourts,
    byVolume,
    recentBulk,
    loading,
    error,
  } = useSelector((state) => state.admin);

  // Fetch both record stats and bulk stats
  useEffect(() => {
    dispatch(fetchAdminStats());
    dispatch(fetchBulkStats());
  }, [dispatch]);

  const recordCards = [
    { title: "Total Records", value: totalRecords, color: "bg-blue-500" },
    { title: "Approved Records", value: approved, color: "bg-green-500" },
    { title: "Pending Records", value: pending, color: "bg-yellow-500" },
  ];

  const bulkCards = [
    { title: "Total Bulk Cases", value: totalCases, color: "bg-purple-500" },
    { title: "Total Courts Covered", value: totalCourts, color: "bg-pink-500" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Record Stats */}
      <h2 className="text-xl font-semibold mb-4">📊 Records Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {recordCards.map((c, idx) => (
          <div
            key={idx}
            className={`${c.color} text-white rounded-lg p-6 shadow-md`}
          >
            <h2 className="text-lg font-semibold">{c.title}</h2>
            <p className="text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Bulk Stats */}
      <h2 className="text-xl font-semibold mb-4">📦 Bulk Gazette Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {bulkCards.map((c, idx) => (
          <div
            key={idx}
            className={`${c.color} text-white rounded-lg p-6 shadow-md`}
          >
            <h2 className="text-lg font-semibold">{c.title}</h2>
            <p className="text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      {/* By Volume Breakdown */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">📚 Cases by Volume</h2>
        {byVolume && Object.keys(byVolume).length > 0 ? (
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(byVolume).map(([volume, count]) => (
              <li key={volume}>
                <span className="font-medium">Volume {volume}:</span> {count}{" "}
                cases
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No volume breakdown available.</p>
        )}
      </div>

      {/* Recent Records */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">🕒 Recent Records</h2>
        {loading ? (
          <p className="text-gray-500">Loading recent records...</p>
        ) : recentRecords.length > 0 ? (
          <ul className="space-y-2">
            {recentRecords.map((r) => (
              <li key={r._id} className="border-b pb-2">
                {r.courtStation} | {r.causeNo} | {r.nameOfDeceased} |{" "}
                <span className="font-semibold">{r.statusAtGP}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No recent records found.</p>
        )}
      </div>

      {/* Recent Bulk */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">
          📰 Recent Bulk Gazette Uploads
        </h2>
        {loading ? (
          <p className="text-gray-500">Loading recent bulk...</p>
        ) : recentBulk.length > 0 ? (
          <ul className="space-y-2">
            {recentBulk.map((b, idx) => (
              <li key={idx} className="border-b pb-2">
                <span className="font-medium">Volume {b.volumeNo}</span> |{" "}
                {b.totalCases} cases | Published:{" "}
                {b.datePublished
                  ? new Date(b.datePublished).toLocaleDateString()
                  : "-"}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No recent bulk uploads found.</p>
        )}
      </div>

      {/* Error handling */}
      {error && <p className="text-red-500 mt-6">⚠️ {error}</p>}
    </div>
  );
};

export default AdminDashboard;
