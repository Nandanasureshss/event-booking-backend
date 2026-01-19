import Booking from "../Model/ticketbookingSchema.js";
import Event from "../Model/addEventSchema.js";
import transporter from "../config/mailConfig.js";
import path from "path";

// CREATE BOOKING
export const createBooking = async (req, res) => {
  try {
    // ✅ FIX: destructure correct fields
    const {
      eventId,
      seatType,
      adults,
      children,
      pricePerTicket,
      totalAmount,
      userEmail,
    } = req.body;

    // 1️⃣ Get event details
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // 2️⃣ Create booking (FIXED but LOGIC UNCHANGED)
    const booking = new Booking({
      eventId,
      seatType,
      adults,
      children,
      pricePerTicket,
      totalAmount,
      userEmail,
    });

    const savedBooking = await booking.save();

    /* --------------------------------------------------
       ONLINE TICKET → EMAIL ACCESS DETAILS (UNCHANGED)
    ---------------------------------------------------*/
    if (event.ticketType === "online") {
      if (userEmail) {
        try {
          await transporter.sendMail({
            to: userEmail,
            subject: "Your Event Ticket – Access Details",
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Event Ticket Confirmation</h2>

                <p>Dear Guest,</p>

                <p>
                  Thank you for booking your ticket for
                  <b>${event.eventName}</b>.
                </p>

                <p><b>Seat Type:</b> ${seatType}</p>
                <p><b>Total Amount:</b> ₹${totalAmount}</p>

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
       PDF TICKET → SEND PDF VIA EMAIL (UNCHANGED)
    ---------------------------------------------------*/
    if (event.ticketType === "pdf") {
      if (userEmail && event.ticketPdf) {
        try {
          const pdfPath = path.join(
            process.cwd(),
            "uploads",
            event.ticketPdf
          );

          await transporter.sendMail({
            to: userEmail,
            subject: "Your Event Ticket (PDF)",
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Event Ticket Confirmation</h2>

                <p>Dear Guest,</p>

                <p>
                  Thank you for booking your ticket for
                  <b>${event.eventName}</b>.
                </p>

                <p><b>Seat Type:</b> ${seatType}</p>
                <p><b>Total Amount:</b> ₹${totalAmount}</p>

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
        ticketPdfUrl: `/uploads/${event.ticketPdf}`,
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

// GET ALL BOOKINGS FOR A USER (UNCHANGED LOGIC, JUST FIXED FIELD)
export const getBookingsByUser = async (req, res) => {
  try {
    const bookings = await Booking.find({
      userEmail: req.params.email,
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
