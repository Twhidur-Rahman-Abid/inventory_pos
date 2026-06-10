/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";

import { Button, Modal, Input, Select, InfoRow } from "@/app/_components";
import { PAYMENT_METHOD } from "@/app/_constants";
import { postJSONData } from "@/app/_actions";
import { toast } from "react-toastify";
import Loading from "@/app/_components/ui/Loading";
import { useCart } from "@/app/_context/productOrderCartContext";

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
};

export default function PaymentModal({
  onClose = () => {},
  orderPayload,
  onRightSideClose = () => {},
}: ModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState("full");

  const [advancePay, setAdvancePay] = useState("");
  const [cash, setCash] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { clearCart, handleProductQuantity } = useCart();

  const orderAction = async () => {
    setIsLoading(true);
    const res = await postJSONData({
      endpoint: "/orders",
      formData: {
        ...orderPayload,
        payment_method: paymentMethod || "cash",
        note,
      },
    });

    setIsLoading(false);

    if (res?.status === "success") {
      handleProductQuantity(orderPayload?.items || []);
      toast.success("Order confirmed!");
      onClose();
      onRightSideClose();
      clearCart();
    } else {
      toast.error(res?.message);
    }
  };

  return (
    <Modal title="Payment" onClose={onClose}>
      <div className="py-4 space-y-8 text-secondary text-sm font-medium">
        {/* Pay */}
        <InfoRow
          Left={<p className="w-full">Pay</p>}
          Right={
            <p className="w-full text-xl font-semibold">
              {orderPayload?.total} TK
            </p>
          }
        />

        <InfoRow
          Left={<p className="w-full">Type</p>}
          Right={
            <Select
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
          }
        />
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
        <Button onClick={orderAction} disabled={isLoading}>
          {isLoading ? <Loading /> : "Order"}
        </Button>
      </div>
    </Modal>
  );
}
