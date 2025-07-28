import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadUser } from "../../store/slices/authSlice";

const Profile = () => {
  const dispatch = useDispatch();

  const { user, loading, error } = useSelector((state) => state.auth || {});

  useEffect(() => {
    if (!user) {
      dispatch(loadUser());
    }
  }, [dispatch, user]);

  if (loading) return <div className="p-6">Loading profile...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      {user ? (
        <div className="bg-white shadow-md rounded-lg p-6 max-w-md">
          <div className="mb-4">
            <p className="text-gray-600">Name</p>
            <p className="text-lg font-semibold">{user.name}</p>
          </div>
          <div className="mb-4">
            <p className="text-gray-600">Email</p>
            <p className="text-lg font-semibold">{user.email}</p>
          </div>
          {/* Add more fields as needed */}
        </div>
      ) : (
        <p className="text-gray-700">No user data available.</p>
      )}
    </div>
  );
};

export default Profile;
