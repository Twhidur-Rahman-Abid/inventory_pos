/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";

import { Button, Modal, Input, Select, InfoRow } from "@/app/_components";
import { PAYMENT_METHOD } from "@/app/_constants";

export default function PaymentModal({ onClose = () => {} }) {
  const [paymentStatus, setPaymentStatus] = useState("full");
  const [paymentMethod, setPaymentMethod] = useState<any>(null);
  const [advancePay, setAdvancePay] = useState("");
  const [cash, setCash] = useState("");
  const [note, setNote] = useState("");

  const total = 500;

  return (
    <Modal title="Payment" onClose={onClose}>
      <div className="py-4 space-y-8 text-secondary text-sm font-medium">
        {/* Pay */}
        <InfoRow
          Left={<p className="w-full">Pay</p>}
          Right={<p className="w-full text-xl font-semibold">{total} Tk</p>}
        />

        {/* Payment Type */}
        {paymentStatus !== "due" && (
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
        )}

        {/* Payment Status */}
        <InfoRow
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
        />

        {/* Advance */}
        {paymentStatus === "advance" && (
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
        )}

        {/* Due */}
        {paymentStatus === "due" && (
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
        )}

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
        <Button>Order</Button>
      </div>
    </Modal>
  );
}
