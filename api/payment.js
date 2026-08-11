export default async function handler(req, res) {
    // ============================================================
    // ONLY ALLOW POST
    // ============================================================

    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed"
        });
    }

    try {
        // ========================================================
        // GET DATA FROM FRONTEND
        // ========================================================

        const {
            name,
            email,
            phone,
            amount,
            transaction_id
        } = req.body || {};

        // ========================================================
        // VALIDATE REQUIRED FIELDS
        // ========================================================

        if (!name || !email || !phone || !amount || !transaction_id) {
            return res.status(400).json({
                success: false,
                message: "Missing required payment information"
            });
        }

        // ========================================================
        // CLEAN PHONE NUMBER
        // ========================================================

        let cleanPhone = String(phone).trim().replace(/\s+/g, "");

        // Example:
        // 0744000000 -> 255744000000
        // 255744000000 -> stays 255744000000

        if (cleanPhone.startsWith("0")) {
            cleanPhone = "255" + cleanPhone.substring(1);
        }

        // ========================================================
        // VALIDATE TANZANIAN PHONE
        // ========================================================

        if (!/^255(6|7)\d{8}$/.test(cleanPhone)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Tanzanian phone number"
            });
        }

        // ========================================================
        // VALIDATE AMOUNT
        // ========================================================

        const paymentAmount = Number(amount);

        if (
            !Number.isFinite(paymentAmount) ||
            paymentAmount <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment amount"
            });
        }

        // ========================================================
        // CHECK PALMPESA TOKEN
        // ========================================================

        if (!process.env.PALMPESA_TOKEN) {
            console.error("PALMPESA_TOKEN is missing");

            return res.status(500).json({
                success: false,
                message: "PalmPesa configuration is missing"
            });
        }

        // ========================================================
        // SEND PAYMENT REQUEST TO PALMPESA
        // ========================================================

        const palmPesaResponse = await fetch(
            "https://palmpesa.drmlelwa.co.tz/api/pay-via-mobile",
            {
                method: "POST",

                headers: {
                    "Authorization":
                        `Bearer ${process.env.PALMPESA_TOKEN}`,

                    "Content-Type": "application/json",

                    "Accept": "application/json"
                },

                body: JSON.stringify({
                    user_id: "2",

                    name: name,

                    email: email,

                    phone: cleanPhone,

                    amount: paymentAmount,

                    transaction_id: transaction_id,

                    address: "Tanzania",

                    postcode: "00000",

                    buyer_uuid: 0
                })
            }
        );

        // ========================================================
        // READ PALMPESA RESPONSE
        // ========================================================

        const responseText = await palmPesaResponse.text();

        let palmPesaData;

        try {
            palmPesaData = JSON.parse(responseText);
        } catch {
            palmPesaData = {
                raw: responseText
            };
        }

        console.log(
            "PalmPesa HTTP status:",
            palmPesaResponse.status
        );

        console.log(
            "PalmPesa response:",
            palmPesaData
        );

        // ========================================================
        // PALMPESA REJECTED REQUEST
        // ========================================================

        if (!palmPesaResponse.ok) {
            return res.status(500).json({
                success: false,

                message:
                    palmPesaData?.message ||
                    "PalmPesa rejected the payment",

                palmPesa: palmPesaData
            });
        }

        // ========================================================
        // SUCCESS
        // ========================================================

        return res.status(200).json({
            success: true,

            message: "Payment request sent successfully",

            transaction_id: transaction_id,

            phone: cleanPhone,

            amount: paymentAmount,

            data: palmPesaData
        });

    } catch (error) {

        // ========================================================
        // SERVER ERROR
        // ========================================================

        console.error(
            "Payment server error:",
            error
        );

        return res.status(500).json({
            success: false,

            message: "Payment server error",

            error: error.message
        });
    }
}
