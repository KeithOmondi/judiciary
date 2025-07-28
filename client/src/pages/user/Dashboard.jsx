import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBorrowedBooks } from "../../store/slices/borrowSlice";
import { fetchUserBooks } from "../../store/slices/bookSlice";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { borrowedBooks, loading: loadingBorrow } = useSelector(state => state.borrow);
  const { books, loading: loadingBooks } = useSelector(state => state.books);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchBorrowedBooks());
    dispatch(fetchUserBooks());
  }, [dispatch]);

  const data = Array.isArray(borrowedBooks) ? borrowedBooks : [];

  const totalBorrowed = data.length;
  const overdueCount = data.filter(b => !b.returnDate && new Date(b.dueDate) < new Date()).length;
  const totalFines = data.reduce((sum, b) => sum + (b.fine || 0), 0);

  const borrowTimeline = data.map(b => ({
    date: b.borrowDate?.slice(0, 10) || b.createdAt?.slice(0, 10),
    fine: b.fine || 0
  })).reduce((acc, curr) => {
    const existing = acc.find(a => a.date === curr.date);
    if (existing) {
      existing.count += 1;
      existing.fine += curr.fine;
    } else {
      acc.push({ date: curr.date, count: 1, fine: curr.fine });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date) - new Date(b.date));

  const pieData = [
    { name: 'Returned', value: data.filter(b => b.returnDate).length },
    { name: 'Not Returned', value: data.filter(b => !b.returnDate).length }
  ];
  const COLORS = ['#4ADE80', '#F87171'];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}</h1>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card title="Books Borrowed" value={totalBorrowed} color="text-blue-600" />
          <Card title="Overdue Books" value={overdueCount} color="text-red-600" />
          <Card title="Total Fines (Ksh)" value={`Ksh ${totalFines}`} color="text-yellow-500" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Borrowings Over Time</h2>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={borrowTimeline}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3B82F6" fill="#BFDBFE" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Return Status</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Borrow Records */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Recent Borrow Records</h2>
          {data.slice().reverse().slice(0, 5).map((b, i) => (
            <div key={i} className="flex justify-between py-1 border-b last:border-b-0">
              <span>{b.book?.title || b.bookTitle}</span>
              <span>{user?.name}</span>
              <span>{new Date(b.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, value, color }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

export default Dashboard;
