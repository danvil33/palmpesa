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
            contentId
        } = req.body || {};


        // ========================================================
        // VALIDATE REQUIRED FIELDS
        // ========================================================

        if (
            !name ||
            !email ||
            !phone ||
            !amount
        ) {

            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });

        }


        // ========================================================
        // CLEAN PHONE NUMBER
        // ========================================================

        let cleanPhone =
            String(phone)
                .trim()
                .replace(/\s+/g, "");


        // 0744000000
        // becomes
        // 255744000000

        if (cleanPhone.startsWith("0")) {

            cleanPhone =
                "255" +
                cleanPhone.substring(1);

        }


        // ========================================================
        // VALIDATE TANZANIAN PHONE
        // ========================================================

        if (!/^255(6|7)\d{8}$/.test(cleanPhone)) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid Tanzanian phone number"

            });

        }


        // ========================================================
        // VALIDATE AMOUNT
        // ========================================================

        const paymentAmount =
            Number(amount);


        if (
            !Number.isFinite(paymentAmount) ||
            paymentAmount <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid payment amount"

            });

        }


        // ========================================================
        // PALMPESA TOKEN
        // ========================================================

        if (!process.env.PALMPESA_TOKEN) {

            console.error(
                "PALMPESA_TOKEN is missing"
            );


            return res.status(500).json({

                success: false,

                message:
                    "PalmPesa configuration is missing"

            });

        }


        // ========================================================
        // CREATE TRANSACTION ID
        // ========================================================

        const transactionId =
            "TXN-" +
            Date.now();


        // ========================================================
        // PALMPESA PAYMENT DATA
        // ========================================================

        const paymentData = {

            name:
                name,

            email:
                email,

            phone:
                cleanPhone,

            amount:
                paymentAmount,

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


        // ========================================================
        // SEND PAYMENT REQUEST
        // ========================================================

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


        // ========================================================
        // READ PALMPESA RESPONSE
        // ========================================================

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


        // ========================================================
        // PARSE RESPONSE
        // ========================================================

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


        // ========================================================
        // PALMPESA FAILED
        // ========================================================

        if (!response.ok) {

            return res.status(
                response.status
            ).json({

                success: false,

                message:
                    data?.message ||
                    "Payment failed",

                palmPesaStatus:
                    response.status,

                transaction_id:
                    transactionId,

                data:
                    data

            });

        }


        // ========================================================
        // SUCCESS
        // ========================================================

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

            contentId:
                contentId || null,

            data:
                data

        });


    } catch (error) {

        // ========================================================
        // SERVER ERROR
        // ========================================================

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
