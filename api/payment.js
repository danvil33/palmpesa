export default async function handler(req, res) {

  /*
   * Only allow POST requests
   */

  if (req.method !== "POST") {

    return res.status(405).json({

      success: false,

      message:
        "Method not allowed"

    });

  }


  try {

    /*
     * Get payment information
     * from the frontend.
     */

    const {
      name,
      email,
      phone,
      amount
    } = req.body;


    /*
     * Validate input
     */

    if (
      !name ||
      !email ||
      !phone ||
      !amount
    ) {

      return res.status(400).json({

        success: false,

        message:
          "All fields are required"

      });

    }


    /*
     * Create unique transaction ID
     */

    const transactionId =
      "TXN-" +
      Date.now();


    /*
     * PalmPesa PAY VIA MOBILE
     *
     * According to the API documentation
     * you provided.
     */

    const paymentData = {

      name:
        name,

      email:
        email,

      phone:
        phone,

      amount:
        Number(amount),

      transaction_id:
        transactionId,

      address:
        "Geita",

      postcode:
        "30100"

    };


    console.log(
      "Sending to PalmPesa:",
      paymentData
    );


    /*
     * Send request to PalmPesa.
     *
     * The API token stays on Vercel.
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
     * Read the response as text first.
     *
     * This helps us see both JSON
     * and non-JSON errors.
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
     * Try to convert response to JSON.
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
     * Return PalmPesa's response
     * to our frontend.
     */

    return res.status(
      response.status
    ).json({

      success:
        response.ok,

      palmPesaStatus:
        response.status,

      transaction_id:
        transactionId,

      data:
        data

    });


  } catch (error) {

    /*
     * Server-side error
     */

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
