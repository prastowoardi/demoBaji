document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("withdrawForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const resultBox = document.getElementById("resultBox");
    resultBox.innerText = "⏳ Mengirim request...";

    const amount = parseFloat(document.getElementById("amount").value);
    const ifsc = document.getElementById("ifsc").value.trim();
    const bankAccountNumber = document.getElementById("bankAccountNumber").value.trim();
    const accountName = document.getElementById("accountName").value.trim();

    if (!amount || amount <= 0 || !ifsc || !bankAccountNumber || !accountName) {
      alert("❌ Semua input harus diisi dan valid!");
      resultBox.innerText = "";
      return;
    }

    const payload = {
      amount,
      ifsc,
      bankAccountNumber,
      accountName
    };

    try {
      const response = await fetch('https://bajipoint.prastowoardi616.workers.dev/', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        resultBox.innerText = "Withdraw Response!\n\n" + JSON.stringify(data, null, 2);
      } else {
        const text = await response.text();
        resultBox.innerText = "⚠️ Not JSON Response:\n\n" + text;
      }
    } catch (error) {
      resultBox.innerText = "❌ Error:\n\n" + error;
    }
  });
});
