import { asyncHandler } from "../utils/asyncHandler.js";

const paymentInitiate = asyncHandler(async (req, res) => {
  const { customer, orderPrice } = req.body;

  const trxId = new mongoose.Types.ObjectId().toString();

  const initiateData = {
    store_id: "ss66f78af2baee0",
    store_passwd: "ss66f78af2baee0@ssl",
    total_amount: orderPrice,
    // orderPrice: payInfo.orderPrice,
    currency: "BDT",
    tran_id: trxId,
    success_url: "http://localhost:8000/success",
    fail_url: "http://localhost:8000/failed",
    cancel_url: "http://localhost:8000/cancelled",
    cus_name: "Customer Name",
    cus_email: "cust@yahoo.com",
    cus_add1: "Dhaka",
    cus_add2: "Dhaka",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone: "01711111111",
    cus_fax: "01711111111",
    ship_name: "Customer Name",
    ship_add1: "Dhaka",
    ship_add2: "Dhaka",
    shipping_method: "No",
    product_name: "My Product",
    product_category: "electro",
    product_profile: "general",
    ship_city: "Dhaka",
    ship_state: "Dhaka",
    ship_postcode: "1000",
    ship_country: "Bangladesh",
    multi_card_name: "mastercard,visacard,amexcard",
    value_a: "ref001_A",
    value_b: "ref002_B",
    value_c: "ref003_C",
    value_d: "ref004_D",
  };

  try {
    const response = await axios({
      method: "POST",
      url: "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
      data: initiateData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    // console.log(amount);

    const newPayment = new Payment({
      customer,
      paymentId: trxId,
      orderPrice,
    });

    const saveRes = await newPayment.save();

    console.log("Payment initiation successful", response.data);
    if (saveRes) {
      res.send({
        paymentUrl: response.data.GatewayPageURL,
      });
    }
  } catch (error) {
    console.error("Payment initiation failed", error.message);
    res.status(500).json({ error: "Payment initiation failed" });
  }
});

export { paymentInitiate };
