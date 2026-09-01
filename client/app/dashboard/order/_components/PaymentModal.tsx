/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";

import { Button, Modal, Input, Select, InfoRow } from "@/app/_components";
import { PAYMENT_METHOD } from "@/app/_constants";
import { postJSONData } from "@/app/_actions";
import { toast } from "react-toastify";
import Loading from "@/app/_components/ui/Loading";
import { useCart } from "@/app/_context/productOrderCartContext";
import PrintInvoice from "@/app/_components/PrintInvoice";
import Image from "next/image";

type ModalProps = {
  onClose: () => void;
  orderPayload: {
    branch_id: number | undefined;
    extra_discount: number;
    delivery: number;
    payment_method?: any;
    total: number;
    items: {
      product_id: number;
      qty: number;
    }[];
  };
  onRightSideClose: () => void;
  onOrderSuccessRightSideClear: () => void;
};

export default function PaymentModal({
  onClose = () => {},
  orderPayload,
  onRightSideClose = () => {},
  onOrderSuccessRightSideClear = () => {},
}: ModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [other_payment_amount, setOtherPaymentAmount] = useState(0);
  const [cash_amount, setCashAmount] = useState(orderPayload.total);
  // const [paymentStatus, setPaymentStatus] = useState("full");

  // const [advancePay, setAdvancePay] = useState("");
  // const [cash, setCash] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { clearCart, handleProductQuantity } = useCart();
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [orderedData, setOrderedData] = useState();
  console.log("orderedData:", orderedData);
  const finalCount = Number(cash_amount) + Number(other_payment_amount);
  const orderAction = async () => {
    if (finalCount !== Number(orderPayload?.total)) {
      toast.error("Total payment amount must equal the order total balance.");
      return;
    }
    if (
      Number(cash_amount) !== Number(orderPayload?.total) &&
      ((other_payment_amount && !paymentMethod) ||
        (!other_payment_amount && paymentMethod))
    ) {
      toast.error(
        "Please select both the other payment method and enter the other amount.",
      );
      return;
    }
    // toast.success("success");
    // return;
    setIsLoading(true);
    const res = await postJSONData({
      endpoint: "/orders",
      formData: {
        ...orderPayload,
        cash_amount,
        other_payment_amount,
        other_payment_method: paymentMethod || null,
        note,
      },
    });

    setIsLoading(false);

    if (res?.status === "success") {
      handleProductQuantity(orderPayload?.items || []);
      toast.success("Order confirmed!");
      // onClose();
      setOrderedData(res?.data?.data);
      setIsPrintOpen(true);
      onOrderSuccessRightSideClear();
      onRightSideClose();
      clearCart();
    } else {
      toast.error(res?.message);
    }
  };

  return (
    <Modal
      title={
        isPrintOpen
          ? "Print Invoice"
          : `Total Payment: ${orderPayload?.total} TK`
      }
      onClose={onClose}
    >
      {isPrintOpen ? (
        <div className="flex gap-6 items-center justify-between mt-4">
          <Button onClick={onClose} isCancel>
            Close
          </Button>
          <PrintInvoice orderData={orderedData} onClose={onClose} />
        </div>
      ) : (
        <div className="py-4 space-y-8 text-secondary text-sm font-medium">
          {/* Payment Type */}
          {/* {paymentStatus !== "due" && (
          <InfoRow
            Left={<p className="w-full">Type</p>}
            Right={
              <Select
                options={PAYMENT_METHOD}
                className="w-full py-3"
                getSelectValue={(val) => setPaymentMethod(val)}
              />
            }
          />
        )} */}

          {/* Payment Status */}
          {/* <InfoRow
          Left={<p className="w-full">Payment Status</p>}
          Right={
            <div className="w-full flex gap-2 justify-between">
              {["full", "advance", "due"].map((status) => (
                <div key={status} className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    className="size-5"
                    checked={paymentStatus === status}
                    onChange={() => setPaymentStatus(status)}
                  />
                  <label className="text-body-text capitalize">
                    {status === "full"
                      ? "Fully Paid"
                      : status === "advance"
                        ? "Advance Paid"
                        : "Due"}
                  </label>
                </div>
              ))}
            </div>
          }
        /> */}

          {/* Advance */}
          {/* {paymentStatus === "advance" && (
          <>
            <InfoRow
              Left={<p className="w-full">Advance Pay</p>}
              Right={
                <Input
                  type="number"
                  placeholder="Amount"
                  defaultValue={advancePay}
                  getInputValue={(val) => setAdvancePay(val)}
                />
              }
            />

            <div className="grid grid-cols-2 gap-6">
              <div className="p-3 rounded-md bg-[#FBEDDB] text-center">
                <p className="font-semibold text-[#F2A444]">Change</p>
                <p className="text-2xl font-semibold mt-2">0 Tk</p>
              </div>

              <div className="p-3 rounded-md bg-[#F3FAF7] text-center">
                <p className="font-semibold text-[#0F5A46]">Cash</p>
                <input
                  className="text-center text-2xl font-semibold w-full bg-white mt-2 h-14"
                  type="number"
                  value={cash}
                  onChange={(e) => setCash(e.target.value)}
                />
              </div>
            </div>
          </>
        )} */}

          {/* Due */}
          {/* {paymentStatus === "due" && (
          <div className="grid grid-cols-2 gap-6">
            <div className="p-3 rounded-md bg-[#FBEDDB] text-center">
              <p className="font-semibold text-[#F2A444]">Due</p>
              <p className="text-2xl font-semibold mt-2">200 Tk</p>
            </div>

            <div className="p-3 rounded-md bg-[#F3FAF7] text-center">
              <p className="font-semibold text-[#0F5A46]">Pay</p>
              <input
                className="text-center text-2xl font-semibold w-full bg-white mt-2 h-14"
                type="number"
                value={cash}
                onChange={(e) => setCash(e.target.value)}
              />
            </div>
          </div>
        )} */}
          <InfoRow
            Left={
              <div className="w-full flex gap-2.5 items-center">
                <p className="">Cash</p>
                <Image
                  src={"/cash.svg"}
                  className="w-6"
                  alt="cash"
                  width={24}
                  height={24}
                />
              </div>
            }
            Right={
              <Input
                type="number"
                placeholder="Cash amount e.g 10"
                defaultValue={cash_amount}
                getInputValue={(val) => setCashAmount(val)}
              />
            }
          />
          <InfoRow
            className="place-items-end"
            Left={
              <div className="w-full max-w-full pr-10">
                <Select
                  label="Other Method"
                  options={PAYMENT_METHOD}
                  className="w-full py-3"
                  getSelectValue={(val: any) => {
                    const value =
                      typeof val === "object" && val !== null
                        ? (val.id ?? val.value)
                        : val;
                    setPaymentMethod(value !== undefined ? String(value) : "");
                  }}
                />
              </div>
            }
            Right={
              <Input
                type="number"
                placeholder="Other amount e.g 10"
                defaultValue={other_payment_amount}
                getInputValue={(val) => setOtherPaymentAmount(val)}
              />
            }
          />

          {/* Note */}
          <InfoRow
            Left={<p className="w-full">Note</p>}
            Right={
              <Input
                type="text"
                placeholder="Note"
                defaultValue={note}
                getInputValue={(val) => setNote(val)}
              />
            }
          />

          {/* Button */}
          <Button
            onClick={orderAction}
            disabled={isLoading || finalCount != orderPayload.total}
            className="uppercase disabled:border disabled:border-red-500"
          >
            {isLoading ? (
              <Loading />
            ) : (
              <span>
                Pay:{" "}
                <span className="text-yellow-400 font-bold">{finalCount}</span>{" "}
                and Order
              </span>
            )}
          </Button>
        </div>
      )}
    </Modal>
  );
}
