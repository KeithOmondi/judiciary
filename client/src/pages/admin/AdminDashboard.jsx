import { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRecords: 0,
    approved: 0,
    pending: 0,
  });
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/api/v1/records"); // fetch all records
      const records = data.records || [];

      // Compute stats
      const totalRecords = records.length;
      const approved = records.filter((r) => r.statusAtGP === "Approved").length;
      const pending = records.filter((r) => r.statusAtGP === "Pending").length;

      // Sort by newest published date for recent records
      const recent = [...records]
        .sort((a, b) => new Date(b.datePublished) - new Date(a.datePublished))
        .slice(0, 5); // last 5 records

      setStats({ totalRecords, approved, pending });
      setRecentRecords(recent);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard stats", err);
      setLoading(false);
    }
  };

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();

    // Optional: poll every 30 seconds for real-time update
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    { title: "Total Records", value: stats.totalRecords, color: "bg-blue-500" },
    { title: "Approved Records", value: stats.approved, color: "bg-green-500" },
    { title: "Pending Records", value: stats.pending, color: "bg-yellow-500" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c, idx) => (
          <div
            key={idx}
            className={`${c.color} text-white rounded-lg p-6 shadow-md`}
          >
            <h2 className="text-lg font-semibold">{c.title}</h2>
            <p className="text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Recent Records</h2>
        {loading ? (
          <p className="text-gray-500">Loading recent records...</p>
        ) : recentRecords.length > 0 ? (
          <ul className="space-y-2">
            {recentRecords.map((r) => (
              <li key={r._id} className="border-b pb-2">
                {r.courtStation} | {r.causeNo} | {r.nameOfDeceased} | {r.statusAtGP}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No records found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
