import Booking from "../Model/ticketbookingSchema.js";
import Event from "../Model/addEventSchema.js";
import transporter from "../config/mailConfig.js";
import path from "path";

// CREATE BOOKING
export const createBooking = async (req, res) => {
  try {
    const { eventId, user } = req.body;

    // 1️⃣ Get event details
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // 2️⃣ Create booking (UNCHANGED)
    const booking = new Booking(req.body);
    const savedBooking = await booking.save();

    /* --------------------------------------------------
       ONLINE TICKET → EMAIL ACCESS DETAILS (UNCHANGED)
    ---------------------------------------------------*/
    if (event.ticketType === "online") {
      if (user?.email) {
        try {
          await transporter.sendMail({
            to: user.email,
            subject: "Your Event Ticket – Access Details",
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Event Ticket Confirmation</h2>

                <p>Dear ${user?.name || "Guest"},</p>

                <p>
                  Thank you for booking your ticket for
                  <b>${event.eventName}</b>.
                </p>

                <p>
                  This event uses an <b>online ticket system</b>.
                  Please download the required application to access your ticket.
                </p>

                <p style="margin: 16px 0;"><b>XYZ Application</b></p>

                <p>
                  Log in using your registered email address to view your ticket.
                </p>

                <p style="margin-top: 20px;">
                  Best regards,<br/>
                  <b>Event Management Team</b>
                </p>
              </div>
            `,
          });
        } catch (mailError) {
          console.error("Online ticket email failed:", mailError.message);
        }
      }

      return res.status(201).json({
        success: true,
        booking: savedBooking,
        ticketType: "online",
        message:
          "Booking successful. Ticket access details will be sent to your email.",
      });
    }

    /* --------------------------------------------------
       PDF TICKET → SEND PDF VIA EMAIL (NEW LOGIC)
    ---------------------------------------------------*/
    if (event.ticketType === "pdf") {
      if (user?.email && event.ticketPdf) {
        try {
          const pdfPath = path.join(
            process.cwd(),
            "uploads",
            event.ticketPdf
          );

          await transporter.sendMail({
            to: user.email,
            subject: "Your Event Ticket (PDF)",
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Event Ticket Confirmation</h2>

                <p>Dear ${user?.name || "Guest"},</p>

                <p>
                  Thank you for booking your ticket for
                  <b>${event.eventName}</b>.
                </p>

                <p>
                  Please find your <b>PDF ticket</b> attached to this email.
                </p>

                <p style="margin-top: 20px;">
                  Best regards,<br/>
                  <b>Event Management Team</b>
                </p>
              </div>
            `,
            attachments: [
              {
                filename: "EventTicket.pdf",
                path: pdfPath,
              },
            ],
          });
        } catch (mailError) {
          console.error("PDF ticket email failed:", mailError.message);
        }
      }

      return res.status(201).json({
        success: true,
        booking: savedBooking,
        ticketType: "pdf",
        message: "PDF ticket has been sent to your email",
        ticketPdfUrl: `/uploads/${event.ticketPdf}`, // optional
      });
    }

    // fallback safety
    return res.status(201).json({
      success: true,
      booking: savedBooking,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};


// GET ALL BOOKINGS FOR A USER (UNCHANGED)
export const getBookingsByUser = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
