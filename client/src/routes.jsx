import React from "react";

import AddBook from './pages/admin/AddBook';
import AdminDashboard from './pages/admin/AdminDashboard';
import AllBorrows from './pages/admin/AllBorrows';
import EditBook from './pages/admin/EditBook';
import ManageBooks from './pages/admin/ManageBooks';

import ForgotPassword from './pages/auth/ForgotPassword';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyOTP from './pages/auth/VerifyOTP';

import BookDetails from './pages/user/BookDetails';
import Books from './pages/user/Books';
import ChangePassword from './pages/user/ChangePassword';
import Dashboard from './pages/user/Dashboard';
import MyBorrows from './pages/user/MyBorrows';
import Profile from './pages/user/Profile';
import UserLayout from "./components/user/UserLayout/UserLayout";
import AdminLayout from "./components/admin/AdminLayout/AdminLayout";
import BorrowedBooksList from "./components/admin/BorrowedBooksList";

export const userRoutes = [
  { path: "/dashboard", element: <UserLayout><Dashboard /></UserLayout> },
  { path: "/books", element: <UserLayout><Books /></UserLayout> },
  { path: "/books/:id", element: <UserLayout><BookDetails /></UserLayout> },
  { path: "/my-borrows", element: <UserLayout><MyBorrows /></UserLayout> },
  { path: "/profile", element: <UserLayout><Profile /></UserLayout> },
  { path: "/change-password", element: <UserLayout><ChangePassword /></UserLayout> },
];


export const adminRoutes = [
  {
    path: "/admin/dashboard",
    element: (
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/books",
    element: (
      <AdminLayout>
        <ManageBooks />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/books/add",
    element: (
      <AdminLayout>
        <AddBook />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/books/edit/:id",
    element: (
      <AdminLayout>
        <EditBook />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/borrows",
    element: (
      <AdminLayout>
        <AllBorrows />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/borrowed-books", // ✅ New Route
    element: (
      <AdminLayout>
        <BorrowedBooksList />
      </AdminLayout>
    ),
  },
];


export const authRoutes = [
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/verify-otp", element: <VerifyOTP /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/password/reset/:token", element: <ResetPassword /> },

];
