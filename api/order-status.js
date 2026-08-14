export default async function handler(req, res) {

  if (req.method !== "POST") {

    return res.status(405).json({

      success: false,

      message:
        "Method not allowed"

    });

  }


  try {

    const {
      order_id
    } = req.body || {};


    if (!order_id) {

      return res.status(400).json({

        success: false,

        message:
          "order_id is required"

      });

    }


    console.log(
      "Checking PalmPesa order:",
      order_id
    );


    const response =
      await fetch(
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

          body:
            JSON.stringify({

              order_id:
                order_id

            })

        }
      );


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
     * PalmPesa response:
     *
     * data: [
     *   {
     *     payment_status:
     *       COMPLETED / PENDING / FAILED
     *   }
     * ]
     */

    const payment =
      Array.isArray(data?.data)
        ?
          data.data[0]
        :
          Array.isArray(data?.data?.data)
            ?
              data.data.data[0]
            :
              null;


    const paymentStatus =
      String(

        payment?.payment_status ||

        data?.payment_status ||

        data?.data?.payment_status ||

        ""

      )
      .trim()
      .toUpperCase();


    /*
     * Only accept known statuses.
     */

    let status;

    if (
      paymentStatus ===
      "COMPLETED"
    ) {

      status =
        "COMPLETED";

    } else if (
      paymentStatus ===
      "FAILED"
    ) {

      status =
        "FAILED";

    } else {

      status =
        "PENDING";

    }


    return res.status(
      response.ok
        ? 200
        : response.status
    ).json({

      success:
        response.ok,

      order_id:
        order_id,

      payment_status:
        status,

      reference:
        payment?.reference ||
        data?.reference ||
        null,

      transid:
        payment?.transid ||
        null,

      amount:
        payment?.amount ||
        null,

      channel:
        payment?.channel ||
        null,

      message:
        data?.message ||
        null,

      data:
        data

    });


  } catch (error) {

    console.error(
      "Order status server error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Server error while checking payment status.",

      error:
        error.message

    });

  }

}
