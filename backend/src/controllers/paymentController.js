const crypto = require("crypto");
const axios = require("axios");

exports.createMomoPayment = async (req, res) => {
  const { amount } = req.body;

  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;

  const orderId = `ORDER-${Date.now()}`;
  const requestId = `${partnerCode}-${Date.now()}`;
  const redirectUrl = "http://localhost:5173/payment-success"; // frontend
  const ipnUrl = "https://webhook.site/your-temp-url"; // bạn có thể tạo URL mới ở webhook.site
  const orderInfo = "Thanh toán đơn hàng tại Smartphone Store";
  const requestType = "captureWallet";
  const extraData = ""; // nếu cần truyền thêm gì thì mã hóa base64

  // Tạo rawSignature đúng thứ tự
  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  const body = {
    partnerCode,
    accessKey,
    requestId,
    amount: String(amount), // phải là chuỗi
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    extraData,
    requestType,
    signature,
    lang: "vi",
  };

  try {
    const momoRes = await axios.post(
      "https://test-payment.momo.vn/v2/gateway/api/create",
      body,
      { headers: { "Content-Type": "application/json" } }
    );

    if (momoRes.data?.payUrl) {
      return res.json({ payUrl: momoRes.data.payUrl });
    } else {
      console.error("Momo trả về lỗi:", momoRes.data);
      return res
        .status(400)
        .json({ message: "Momo trả về lỗi", data: momoRes.data });
    }
  } catch (err) {
    console.error("Lỗi gọi Momo:", err?.response?.data || err.message);
    res.status(500).json({ message: "Không thể tạo yêu cầu thanh toán Momo" });
  }
};
