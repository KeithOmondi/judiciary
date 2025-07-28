import cron from "node-cron";
import { Borrow } from "../models/borrowModel.js";
import { User } from "../models/userModel.js";
import { sendEmail } from "../utils/sendMail.js";

export const notifyUsers = () => {
  cron.schedule("*/30 * * * * ", async () => {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const borrowers = await Borrow.find({
        dueDate: {
          $lte: oneDayAgo,
        },
        returnDate: null,
        notified: false,
      });
      for (const element of borrowers) {
        if (element.user && element.user.email) {
          const user = await User.findById(element.user._id);
          sendEmail({
            email,
            subject: "Overdue Book Notification",
            message: `Dear ${user.name},\n\nYou have an overdue book titled "${element.book.title}". Please return it as soon as possible to avoid any penalties.\n\nThank you!`,
          });
          element.notified = true;
          await element.save();
          console.log(`Notification sent to ${element.user.email} for overdue book.`);
        }
      }
    } catch (error) {
        console.error("Error in notifyUsers service:", error);
    }
  });
};
