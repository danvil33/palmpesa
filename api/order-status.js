export default async function handler(req, res) {

  // Only POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {

    const { order_id } = req.body || {};

    // Validate order ID
    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: "order_id is required"
      });
    }

    // Make sure token exists
    if (!process.env.PALMPESA_TOKEN) {
      console.error("PALMPESA_TOKEN is missing.");

      return res.status(500).json({
        success: false,
        message: "Payment server is not configured."
      });
    }

    console.log(
      "Checking PalmPesa order:",
      order_id
    );

    // Ask PalmPesa for the order status
    const response = await fetch(
      "https://palmpesa.drmlelwa.co.tz/api/order-status",
      {
        method: "POST",

        headers: {
          "Authorization":
            `Bearer ${process.env.PALMPESA_TOKEN}`,

          "Content-Type":
            "application/json",

          "Accept":
            "application/json"
        },

        body: JSON.stringify({
          order_id: order_id
        })
      }
    );

    // Read response
    const rawResponse =
      await response.text();

    console.log(
      "PalmPesa status HTTP:",
      response.status
    );

    console.log(
      "PalmPesa status response:",
      rawResponse
    );

    // Parse JSON
    let data;

    try {

      data = JSON.parse(
        rawResponse
      );

    } catch {

      return res.status(502).json({
        success: false,
        message:
          "PalmPesa returned an invalid response.",
        raw_response:
          rawResponse
      });

    }

    /*
     * PalmPesa response:
     *
     * data: [
     *   {
     *     order_id: "...",
     *     payment_status: "COMPLETED"
     *   }
     * ]
     */

    const order =
      Array.isArray(data?.data)
        ? data.data.find(
            item =>
              String(item?.order_id) ===
              String(order_id)
          ) || data.data[0]
        : null;


    /*
     * Get actual payment status.
     */

    const paymentStatus =
      String(
        order?.payment_status || ""
      )
      .trim()
      .toUpperCase();


    /*
     * Only allow these three statuses.
     */

    let finalStatus;

    if (
      paymentStatus ===
      "COMPLETED"
    ) {

      finalStatus =
        "COMPLETED";

    } else if (
      paymentStatus ===
      "FAILED"
    ) {

      finalStatus =
        "FAILED";

    } else {

      finalStatus =
        "PENDING";

    }


    console.log(
      "Order:",
      order_id,
      "Status:",
      finalStatus
    );


    /*
     * Return a simple response
     * to index.html.
     *
     * IMPORTANT:
     * We do NOT unlock anything here.
     */
    return res.status(200).json({

      success: true,

      order_id:
        order_id,

      payment_status:
        finalStatus,

      reference:
        data?.reference ||
        order?.reference ||
        null,

      resultcode:
        data?.resultcode ||
        null,

      result:
        data?.result ||
        null,

      message:
        data?.message ||
        null,

      transid:
        order?.transid ||
        null,

      channel:
        order?.channel ||
        null,

      msisdn:
        order?.msisdn ||
        null,

      amount:
        order?.amount ||
        null

    });

  } catch (error) {

    console.error(
      "Order status server error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to check PalmPesa payment status.",

      error:
        error.message

    });

  }

}
