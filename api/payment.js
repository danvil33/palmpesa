```javascript
export default async function handler(req, res) {

    /*
     * ============================================================
     * ONLY ALLOW POST
     * ============================================================
     */

    if (req.method !== "POST") {

        return res.status(405).json({

            success: false,

            message: "Method not allowed"

        });

    }


    try {

        /*
         * ========================================================
         * GET DATA FROM BETTOR APP
         *
         * The frontend sends ONLY:
         *
         * name
         * email
         * phone
         * amount
         *
         * transaction_id is created HERE.
         * ========================================================
         */

        const {
            name,
            email,
            phone,
            amount
        } = req.body || {};


        /*
         * ========================================================
         * VALIDATE REQUIRED FIELDS
         * ========================================================
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
         * ========================================================
         * CLEAN PHONE
         * ========================================================
         *
         * 0744000000
         * becomes
         * 255744000000
         *
         * 255744000000
         * stays unchanged.
         * ========================================================
         */

        let cleanPhone =
            String(phone)
                .trim()
                .replace(/\s+/g, "");


        if (
            cleanPhone.startsWith("0")
        ) {

            cleanPhone =
                "255" +
                cleanPhone.substring(1);

        }


        /*
         * ========================================================
         * VALIDATE TANZANIAN PHONE
         * ========================================================
         */

        if (
            !/^255(6|7)\d{8}$/.test(
                cleanPhone
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid Tanzanian phone number"

            });

        }


        /*
         * ========================================================
         * VALIDATE AMOUNT
         * ========================================================
         */

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


        /*
         * ========================================================
         * CHECK PALMPESA TOKEN
         * ========================================================
         */

        if (
            !process.env.PALMPESA_TOKEN
        ) {

            console.error(
                "PALMPESA_TOKEN is missing"
            );


            return res.status(500).json({

                success: false,

                message:
                    "PalmPesa configuration is missing"

            });

        }


        /*
         * ========================================================
         * CREATE UNIQUE TRANSACTION ID
         * ========================================================
         */

        const transactionId =
            "TXN-" +
            Date.now();


        /*
         * ========================================================
         * PALMPESA PAYMENT DATA
         *
         * KEEP THIS STRUCTURE.
         *
         * This is the structure from the version
         * you confirmed was working.
         * ========================================================
         */

        const paymentData = {

            name:
                String(name),

            email:
                String(email),

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


        /*
         * ========================================================
         * SEND PAYMENT REQUEST TO PALMPESA
         * ========================================================
         */

        const response =
            await fetch(

                "https://palmpesa.drmlelwa.co.tz/api/pay-via-mobile",

                {

                    method:
                        "POST",

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
         * ========================================================
         * READ RESPONSE AS TEXT
         *
         * This is important because PalmPesa may return
         * JSON or a non-JSON response.
         * ========================================================
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
         * ========================================================
         * PARSE JSON IF POSSIBLE
         * ========================================================
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
         * ========================================================
         * RETURN PALMPESA RESULT
         *
         * IMPORTANT:
         * We return PalmPesa's actual HTTP status.
         * This makes debugging much easier.
         * ========================================================
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
         * ========================================================
         * SERVER ERROR
         * ========================================================
         */

        console.error(
            "Payment server error:",
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
```
