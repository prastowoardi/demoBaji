import CryptoJS from "crypto-js";

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
        const body = await request.json();
        const { amount, ifsc, bankAccountNumber, accountName } = body;

        if (!amount || !ifsc || !bankAccountNumber || !accountName) {
            return new Response("❌ Missing required fields.", { status: 400, headers: corsHeaders });
        }

        const timestamp = Math.floor(Date.now() / 1000);
        const bankCode = ifsc.substring(0, 4);

        const payload = {
            merchant_code: env.MERCHANT_CODE,
            transaction_code: `TEST-WD-${timestamp}`,
            transaction_timestamp: timestamp,
            transaction_amount: amount,
            user_id: "123",
            currency_code: "INR",
            payout_code: env.PAYOUT_CODE,
            callback_url: "https://uptight-state-10.webhook.cool",
            account_name: accountName,
            ifsc_code: ifsc,
            bank_account_number: bankAccountNumber,
            bank_code: bankCode,
            bank_name: bankCode
        };

        console.log("Final payload:", payload);

        const merchantApi = decodeURIComponent(env.MERCHANT_API);
        const secretKey = decodeURIComponent(env.SECRET_KEY);

        const key = CryptoJS.SHA256(merchantApi);
        const iv = CryptoJS.enc.Hex.parse(
            CryptoJS.SHA256(secretKey).toString().substring(0, 32)
        );

        const rawEncrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), key, {
            iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }).toString();

        const encrypted = encodeURIComponent(rawEncrypted);

        console.log("Encrypted payload:", encrypted);

        const response = await fetch(`https://api.paybo.io/api/v1/payout/${env.MERCHANT_CODE}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: encrypted })
        });

        const contentType = response.headers.get("content-type");
        const responseBody = contentType && contentType.includes("application/json")
            ? await response.json()
            : await response.text();

        return new Response(
            typeof responseBody === "string" ? responseBody : JSON.stringify(responseBody),
            {
            status: response.status,
            headers: {
                ...corsHeaders,
                "Content-Type": contentType || "text/plain"
            }
            }
        );
    } catch (err) {
      return new Response("❌ Server error: " + err.message, {
        status: 500,
        headers: corsHeaders
      });
    }
  }
}
