import CryptoJS from "crypto-js";

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    try {
      const body = await request.json();
      const { amount, ifsc, bankAccountNumber, accountName } = body;

      if (!amount || !ifsc || !bankAccountNumber || !accountName) {
        return new Response("❌ Invalid request: Missing required fields.", {
          status: 400,
          headers: corsHeaders
        });
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const transactionCode = `TEST-WD-${timestamp}`;
      const userID = "123";
      const bankCode = ifsc.substring(0, 4);

      const payload = {
        merchant_code: env.MERCHANT_CODE,
        transaction_code: transactionCode,
        transaction_timestamp: timestamp,
        transaction_amount: amount,
        user_id: userID,
        currency_code: "INR",
        payout_code: env.PAYOUT_CODE,
        callback_url: env.CALLBACK_URL,
        account_name: accountName,
        ifsc_code: ifsc,
        bank_account_number: bankAccountNumber,
        bank_code: bankCode,
        bank_name: bankCode
      };

      const encrypted = encryptWithdrawPayload(payload, env.MERCHANT_API, env.SECRET_KEY);

      const response = await fetch(`https://api.paybo.io/api/v1/payout/${env.MERCHANT_CODE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
            'Content-Type': contentType || 'text/plain'
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
};

function encryptWithdrawPayload(data, apikey, secretkey) {
  const key = CryptoJS.SHA256(apikey);
  const iv = CryptoJS.enc.Utf8.parse(CryptoJS.SHA256(secretkey).toString(CryptoJS.enc.Hex).substring(0, 16));
  const dataString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(dataString, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }).toString();
}
