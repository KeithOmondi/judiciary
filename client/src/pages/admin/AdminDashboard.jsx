import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A", "#8884d8"];

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalBooks: 0, totalUsers: 0, totalBorrows: 0 });
  const [monthlyBorrows, setMonthlyBorrows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/admin/dashboard");
        const data = res.data;

        setStats(data.stats || { totalBooks: 0, totalUsers: 0, totalBorrows: 0 });
        setMonthlyBorrows(data.monthlyBorrows || []);
        setCategories(data.categories || []);
        setRecentActivity(data.recentActivity || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-6 text-center text-blue-600 text-lg">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-center text-red-600 text-lg">{error}</div>;

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded shadow p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Total Books</h2>
          <p className="text-3xl font-bold text-blue-600">{stats.totalBooks}</p>
        </div>
        <div className="bg-white rounded shadow p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Total Users</h2>
          <p className="text-3xl font-bold text-green-600">{stats.totalUsers}</p>
        </div>
        <div className="bg-white rounded shadow p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Total Borrows</h2>
          <p className="text-3xl font-bold text-purple-600">{stats.totalBorrows}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-8">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">Monthly Borrows</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyBorrows}>
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="borrows" fill="#3182ce" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded shadow flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-4">Book Categories Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categories}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">User</th>
              <th className="border p-2 text-left">Action</th>
              <th className="border p-2 text-left">Book</th>
              <th className="border p-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentActivity.map(({ id, user, action, book, date }) => (
              <tr key={id} className="hover:bg-gray-50">
                <td className="border p-2">{user}</td>
                <td className="border p-2 capitalize">{action}</td>
                <td className="border p-2">{book}</td>
                <td className="border p-2">{new Date(date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
