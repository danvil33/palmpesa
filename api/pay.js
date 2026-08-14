export default async function handler(req, res) {

  /*
   * Only allow POST requests
   */

  if (req.method !== "POST") {

    return res.status(405).json({

      success: false,

      message: "Method not allowed"

    });

  }


  try {

    /*
     * Receive payment information
     * from index.html
     */

    const {
      name,
      email,
      phone,
      amount,
      postId,
      userId
    } = req.body;


    /*
     * Validate
     */

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

        message: "All fields are required"

      });

    }


    /*
     * Validate amount
     */

    const numericAmount =
      Number(amount);


    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {

      return res.status(400).json({

        success: false,

        message: "Invalid amount"

      });

    }


    /*
     * Create unique transaction ID
     */

    const transactionId =
      "KB-" +
      Date.now() +
      "-" +
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();


    /*
     * PalmPesa payment data
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
      "Sending payment to PalmPesa:",
      paymentData
    );


    /*
     * Send request to PalmPesa
     *
     * PALMPESA_TOKEN stays on Vercel.
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
     * Read response as text first
     */

    const rawResponse =
      await response.text();


    console.log(
      "PalmPesa HTTP status:",
      response.status
    );


    console.log(
      "PalmPesa response:",
      rawResponse
    );


    /*
     * Convert response to JSON
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
     * Return response to frontend
     */

    return res.status(
      response.status
    ).json({

      success:
        response.ok,

      transaction_id:
        transactionId,

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
      "Server error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Server error while contacting PalmPesa",

      error:
        error.message

    });

  }

}
