import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addRecord, resetRecordState } from "../../store/slices/recordsSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddRecord = () => {
  const dispatch = useDispatch();
  const { loading, error, message } = useSelector((state) => state.records);

  // ✅ Include rejectionReason
  const [formData, setFormData] = useState({
    courtStation: "",
    causeNo: "",
    nameOfDeceased: "",
    dateReceived: "",
    statusAtGP: "Pending",
    datePublished: "",
    volumeNo: "",
    rejectionReason: "", // optional
  });

  useEffect(() => {
    if (message) {
      toast.success(message);
      setFormData({
        courtStation: "",
        causeNo: "",
        nameOfDeceased: "",
        dateReceived: "",
        statusAtGP: "Pending",
        datePublished: "",
        volumeNo: "",
        rejectionReason: "",
      });
      dispatch(resetRecordState());
    }

    if (error) {
      toast.error(error);
      dispatch(resetRecordState());
    }
  }, [message, error, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const {
      courtStation,
      causeNo,
      nameOfDeceased,
      dateReceived,
      statusAtGP,
      datePublished,
      volumeNo,
      rejectionReason,
    } = formData;

    if (
      !courtStation ||
      !causeNo ||
      !nameOfDeceased ||
      !dateReceived ||
      !statusAtGP ||
      !datePublished ||
      !volumeNo
    ) {
      toast.error("⚠️ Please fill in all required fields");
      return;
    }

    if (statusAtGP === "Rejected" && !rejectionReason.trim()) {
      toast.error("⚠️ Please provide a rejection reason");
      return;
    }

    dispatch(addRecord(formData));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        📄 Add New Court Record
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        <div>
          <label className="block mb-1 font-medium">Court Station</label>
          <input
            type="text"
            name="courtStation"
            value={formData.courtStation}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Cause No.</label>
          <input
            type="text"
            name="causeNo"
            value={formData.causeNo}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Name of Deceased</label>
          <input
            type="text"
            name="nameOfDeceased"
            value={formData.nameOfDeceased}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Date Received</label>
          <input
            type="date"
            name="dateReceived"
            value={formData.dateReceived}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Status at G.P</label>
          <select
            name="statusAtGP"
            value={formData.statusAtGP}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {formData.statusAtGP === "Rejected" && (
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium text-red-600">
              Reason for Rejection
            </label>
            <textarea
              name="rejectionReason"
              value={formData.rejectionReason}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              rows="3"
              required={formData.statusAtGP === "Rejected"}
            />
          </div>
        )}

        <div>
          <label className="block mb-1 font-medium">Date Published</label>
          <input
            type="date"
            name="datePublished"
            value={formData.datePublished}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Volume No.</label>
          <input
            type="text"
            name="volumeNo"
            value={formData.volumeNo}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Adding..." : "Add Record"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRecord;
