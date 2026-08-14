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
      amount,
      postId,
      userId
    } = req.body || {};

    // Validate required fields
    if (!name || !email || !phone || !amount) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and amount are required."
      });
    }

    const numericAmount = Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount."
      });
    }

    /*
     * Create our own transaction ID.
     */
    const transactionId =
      "TXN-" +
      Date.now() +
      "-" +
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    /*
     * Payment information sent to PalmPesa.
     */
    const paymentData = {

      name: name,

      email: email,

      phone: phone,

      amount: numericAmount,

      transaction_id:
        transactionId,

      address: "Geita",

      postcode: "30100"

    };

    console.log(
      "Starting PalmPesa payment:",
      {
        transaction_id:
          transactionId,

        amount:
          numericAmount,

        postId:
          postId || null,

        userId:
          userId || null
      }
    );


    /*
     * IMPORTANT:
     *
     * PALMPESA_TOKEN MUST ONLY EXIST
     * IN VERCEL ENVIRONMENT VARIABLES.
     */
    if (!process.env.PALMPESA_TOKEN) {

      console.error(
        "PALMPESA_TOKEN is missing."
      );

      return res.status(500).json({
        success: false,
        message:
          "Payment server is not configured."
      });

    }


    /*
     * Send payment request to PalmPesa.
     */
    const response =
      await fetch(
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
            JSON.stringify(
              paymentData
            )

        }
      );


    /*
     * Read response as text first.
     */
    const rawResponse =
      await response.text();


    console.log(
      "PalmPesa HTTP status:",
      response.status
    );

    console.log(
      "PalmPesa raw response:",
      rawResponse
    );


    /*
     * Convert PalmPesa response to JSON.
     */
    let data;

    try {

      data =
        JSON.parse(
          rawResponse
        );

    } catch {

      data = {
        raw_response:
          rawResponse
      };

    }


    /*
     * Find PalmPesa ORDER ID.
     *
     * Different API responses can put
     * the order_id in different places.
     */
    const orderId =

      data?.order_id ||

      data?.orderId ||

      data?.data?.order_id ||

      data?.data?.orderId ||

      data?.data?.[0]?.order_id ||

      data?.data?.[0]?.orderId ||

      null;


    /*
     * PalmPesa rejected the request.
     */
    if (!response.ok) {

      return res.status(
        response.status
      ).json({

        success: false,

        message:
          data?.message ||
          "PalmPesa rejected the payment request.",

        transaction_id:
          transactionId,

        data:
          data

      });

    }


    /*
     * Payment request succeeded,
     * but PAYMENT IS NOT COMPLETED YET.
     *
     * The user still has to enter the PIN.
     */
    if (!orderId) {

      console.error(
        "PalmPesa did not return order_id:",
        data
      );

      return res.status(502).json({

        success: false,

        message:
          "PalmPesa did not return an order ID.",

        transaction_id:
          transactionId,

        data:
          data

      });

    }


    /*
     * Return ONLY the information
     * needed by index.html.
     *
     * DO NOT return payment_status=COMPLETED.
     */
    return res.status(200).json({

      success: true,

      payment_started: true,

      transaction_id:
        transactionId,

      order_id:
        orderId,

      message:
        "Payment request sent. Waiting for customer payment confirmation."

    });


  } catch (error) {

    console.error(
      "PalmPesa payment error:",
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
