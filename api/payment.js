export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const { name, email, phone, amount } = req.body;

    if (!name || !email || !phone || !amount) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const transactionId = "TXN-" + Date.now();

    const paymentData = {
      name,
      email,
      phone,
      amount: Number(amount),
      transaction_id: transactionId,
      address: "Geita",
      postcode: "30100"
    };

    const response = await fetch(
      "https://palmpesa.drmlelwa.co.tz/api/pay-via-mobile",
      {
        method: "POST",

        headers: {
          "Authorization": `Bearer ${process.env.PALMPESA_TOKEN}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },

        body: JSON.stringify(paymentData)
      }
    );

    const raw = await response.text();

    console.log("PalmPesa status:", response.status);
    console.log("PalmPesa response:", raw);

    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      data = { raw_response: raw };
    }

    return res.status(response.status).json({
      success: response.ok,
      palmPesaStatus: response.status,
      transaction_id: transactionId,
      data
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
