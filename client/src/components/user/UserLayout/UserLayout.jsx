import React from "react";
import Sidebar from "./Sidebar";

const UserLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar className="w-64" />

      {/* Page content */}
      <main className="p-6 bg-gray-50 flex-grow">{children}</main>
    </div>
  );
};

export default UserLayout;
