export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed"
        });
    }

    try {
        console.log("========== PAYMENT START ==========");

        console.log("Request body:", req.body);

        const {
            name,
            email,
            phone,
            amount,
            transaction_id
        } = req.body || {};

        // ---------------------------------------------------------
        // VALIDATION
        // ---------------------------------------------------------

        if (!name || !email || !phone || !amount) {
            console.log("Missing fields:", {
                name: !!name,
                email: !!email,
                phone: !!phone,
                amount: !!amount
            });

            return res.status(400).json({
                success: false,
                message: "Missing required payment information",
                received: {
                    name: !!name,
                    email: !!email,
                    phone: !!phone,
                    amount: amount
                }
            });
        }

        // ---------------------------------------------------------
        // PHONE
        // ---------------------------------------------------------

        let cleanPhone = String(phone)
            .trim()
            .replace(/\s+/g, "");

        if (cleanPhone.startsWith("0")) {
            cleanPhone =
                "255" + cleanPhone.substring(1);
        }

        if (!/^255(6|7)\d{8}$/.test(cleanPhone)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Tanzanian phone number",
                phone: cleanPhone
            });
        }

        // ---------------------------------------------------------
        // AMOUNT
        // ---------------------------------------------------------

        const paymentAmount = Number(amount);

        console.log("Payment amount:", paymentAmount);

        if (
            !Number.isFinite(paymentAmount) ||
            paymentAmount <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment amount",
                amount
            });
        }

        // ---------------------------------------------------------
        // TOKEN
        // ---------------------------------------------------------

        if (!process.env.PALMPESA_TOKEN) {
            console.error(
                "PALMPESA_TOKEN DOES NOT EXIST"
            );

            return res.status(500).json({
                success: false,
                message:
                    "PALMPESA_TOKEN is missing from server environment"
            });
        }

        console.log(
            "PALMPESA_TOKEN exists:",
            true
        );

        // ---------------------------------------------------------
        // TRANSACTION ID
        // ---------------------------------------------------------

        const transactionId =
            transaction_id ||
            `BETLIVE-${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase()}`;

        console.log(
            "Transaction ID:",
            transactionId
        );

        // ---------------------------------------------------------
        // PALMPESA REQUEST
        // ---------------------------------------------------------

        const payload = {
            user_id: "2",

            name: name,

            email: email,

            phone: cleanPhone,

            amount: paymentAmount,

            transaction_id: transactionId,

            address: "Tanzania",

            postcode: "00000",

            buyer_uuid: 0
        };

        console.log(
            "Sending PalmPesa payload:",
            payload
        );

        const palmPesaResponse = await fetch(
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

                body: JSON.stringify(payload)
            }
        );

        // ---------------------------------------------------------
        // READ RESPONSE
        // ---------------------------------------------------------

        const responseText =
            await palmPesaResponse.text();

        console.log(
            "PalmPesa HTTP status:",
            palmPesaResponse.status
        );

        console.log(
            "PalmPesa raw response:",
            responseText
        );

        let palmPesaData;

        try {
            palmPesaData =
                JSON.parse(responseText);
        } catch {
            palmPesaData = {
                raw: responseText
            };
        }

        console.log(
            "PalmPesa parsed response:",
            palmPesaData
        );

        // ---------------------------------------------------------
        // PALMPESA ERROR
        // ---------------------------------------------------------

        if (!palmPesaResponse.ok) {

            return res.status(502).json({
                success: false,

                message:
                    palmPesaData?.message ||
                    palmPesaData?.error ||
                    `PalmPesa returned HTTP ${palmPesaResponse.status}`,

                palmPesaStatus:
                    palmPesaResponse.status,

                palmPesa:
                    palmPesaData
            });
        }

        // ---------------------------------------------------------
        // SUCCESS
        // ---------------------------------------------------------

        console.log(
            "========== PAYMENT SUCCESS =========="
        );

        return res.status(200).json({

            success: true,

            message:
                "Payment request sent successfully",

            transaction_id:
                transactionId,

            phone:
                cleanPhone,

            amount:
                paymentAmount,

            data:
                palmPesaData
        });

    } catch (error) {

        console.error(
            "========== PAYMENT SERVER ERROR =========="
        );

        console.error(
            "Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Payment server error",

            error:
                error.stack ||
                String(error)
        });
    }
}
