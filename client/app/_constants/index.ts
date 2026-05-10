const BASE_URL = "http://127.0.0.1:8000/api/v1";

// MONEY SYMBOL BDT
const MONEY_SYMBOL = "৳";
const MONEY_TITLE = "BDT";

const PAYMENT_METHOD = [
  { value: "cash", label: "Cash", img: "/cash.svg" },
  { value: "Bkhas", label: "Bkash", img: "/BKash.svg" },
  { value: "nagad", label: "Nagad", img: "/Nagad.svg" },
  { value: "rocket", label: "Rocket", img: "/rocket.png" },
];

export { MONEY_SYMBOL, MONEY_TITLE, PAYMENT_METHOD, BASE_URL };
