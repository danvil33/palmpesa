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


    if (
      !name ||
      !email ||
      !phone ||
      !amount ||
      !postId ||
      !userId
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Name, email, phone, amount, postId and userId are required."

      });

    }


    const numericAmount =
      Number(amount);


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
     * PalmPesa transaction ID
     */

    const transactionId =
      "TXN-" +
      Date.now();


    /*
     * PalmPesa payment payload
     */

    const paymentData = {

      name: name,

      email: email,

      phone: phone,

      amount: numericAmount,

      transaction_id:
        transactionId,

      address:
        "Geita",

      postcode:
        "30100"

    };


    console.log(
      "Sending payment to PalmPesa:",
      paymentData
    );


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


    const rawResponse =
      await response.text();


    console.log(
      "PalmPesa HTTP:",
      response.status
    );


    console.log(
      "PalmPesa response:",
      rawResponse
    );


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
     * PalmPesa can return order_id
     * in slightly different structures.
     */

    const orderId =
      data?.order_id ||

      data?.data?.order_id ||

      data?.data?.data?.order_id ||

      data?.order?.order_id ||

      data?.data?.order?.order_id;


    if (
      response.ok &&
      !orderId
    ) {

      console.error(
        "PalmPesa did not return order_id:",
        data
      );

      return res.status(502).json({

        success: false,

        message:
          "Payment was sent, but PalmPesa did not return an order ID.",

        data: data

      });

    }


    /*
     * Return everything needed
     * by the frontend.
     */

    return res.status(
      response.status
    ).json({

      success:
        response.ok,

      transaction_id:
        transactionId,

      order_id:
        orderId || null,

      postId:
        postId,

      userId:
        userId,

      amount:
        numericAmount,

      data:
        data

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
