export default async function handler(req, res) {

  if (req.method !== "POST") {

    return res.status(405).json({
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


    if (
      !name ||
      !email ||
      !phone ||
      !amount
    ) {

      return res.status(400).json({
        message: "All fields are required"
      });

    }


    const transactionId =
      "TEST-" + Date.now();


    const palmPesaResponse =
      await fetch(
        "https://palmpesa.drmlelwa.co.tz/api/palmpesa/initiate",
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

              name,

              email,

              phone,

              amount: Number(amount),

              transaction_id:
                transactionId,

              address:
                "Geita",

              postcode:
                "30100"

            })

        }
      );


    const data =
      await palmPesaResponse.json();


    console.log(
      "PalmPesa:",
      data
    );


    if (!palmPesaResponse.ok) {

      return res
        .status(palmPesaResponse.status)
        .json({

          message:
            "PalmPesa rejected the request",

          data

        });

    }


    return res.status(200).json({

      message:
        "Payment initiated. Check your phone.",

      transaction_id:
        transactionId,

      data

    });


  } catch (error) {

    console.error(error);

    return res.status(500).json({

      message:
        "Could not connect to PalmPesa",

      error:
        error.message

    });

  }

}
