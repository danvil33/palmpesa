export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {

    const {
      name,
      email,
      phone,
      amount
    } = req.body;

    if (!name || !email || !phone || !amount) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const transactionId =
      "TXN-" + Date.now();

    const paymentData = {
      name,
      email,
      phone,
      amount: Number(amount),
      transaction_id: transactionId,
      address: "Geita",
      postcode: "30100"
    };

    console.log(
      "Sending payment:",
      paymentData
    );

    const response = await fetch(
      "https://palmpesa.drmlelwa.co.tz/api/pay-via-mobile",
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

        body:
          JSON.stringify(paymentData)
      }
    );

    const rawResponse =
      await response.text();

    console.log(
      "PalmPesa status:",
      response.status
    );

    console.log(
      "PalmPesa response:",
      rawResponse
    );

    let data;

    try {

      data =
        JSON.parse(rawResponse);

    } catch {

      data = {
        raw_response: rawResponse
      };

    }

    /*
     * IMPORTANT:
     *
     * We need the PalmPesa ORDER ID.
     *
     * Try several possible locations because
     * different PalmPesa responses may structure
     * the order ID differently.
     */

    const orderId =
      data?.order_id ||
      data?.data?.order_id ||
      data?.data?.[0]?.order_id ||
      data?.orderId ||
      data?.data?.orderId ||
      null;

    if (!response.ok) {

      return res.status(response.status).json({
        success: false,
        message:
          data?.message ||
          "PalmPesa payment initiation failed.",
        data
      });

    }

    if (!orderId) {

      console.error(
        "NO ORDER ID FOUND:",
        data
      );

      return res.status(502).json({
        success: false,
        message:
          "PalmPesa did not return an order ID.",
        data
      });

    }

    /*
     * DO NOT say payment is completed here.
     *
     * This only means the payment request
     * was successfully initiated.
     */

    return res.status(200).json({

      success: true,

      payment_started: true,

      transaction_id:
        transactionId,

      order_id:
        orderId,

      message:
        "Payment request sent. Waiting for payment completion."

    });

  } catch (error) {

    console.error(
      "Payment server error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Server error while contacting PalmPesa.",

      error:
        error.message

    });

  }

}
