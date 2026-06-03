/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState } from "react";

import { Button, Icon, Input, Modal } from "@/app/_components";
import Table, { Td } from "@/app/_components/ui/Table";
import { cn } from "@/app/_lib/utils";
import PaymentModal from "./PaymentModal";
import { CartType, useCart } from "@/app/_context/productOrderCartContext";

const tableHeaders = [
  { label: "Item" },
  { label: "Qty." },
  { label: "Price" },
  { label: "Delete" },
];

const RightSide = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [delivery, setDelivery] = useState(0);

  const { carts, clearCart } = useCart();

  const subtotal = carts.reduce((acc, item) => acc + item.price * item.qty, 0);
  const total = subtotal - discount + delivery;

  const orderPayload = {
    branch_id: 1,
    extra_discount: discount,
    delivery: delivery,
    items: carts?.map((cart) => ({ product_id: cart.id, qty: cart.qty })),
    total,
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute right-4 top-6 xl:hidden"
      >
        <Icon src="/icon/i-list-2.svg" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/20 z-20"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          `w-[80vw] max-h-fit absolute  z-20  top-4 transition-all ease-in-out duration-300 xl:static sm:min-w-fit sm:w-fit xl:block  bg-white shadow-1 p-6 2xl:p-10 -translate-y-4  md:-translate-y-8 space-y-10`,
          {
            "right-0 top-4": isOpen,
            "-right-full": !isOpen,
          },
        )}
      >
        <div className="flex-between pb-5 border-b border-dashed border-[#ccc]">
          <p className="text-lg text-secondary font-semibold ">
            Billing Section
          </p>
        </div>
        {/* Cart length and cart clear */}
        <div className="flex-between">
          <div className="flex gap-5 items-center text-md font-semibold text-secondary">
            <p className="whitespace-nowrap">Total Item</p>
            <p className="flex justify-center items-center p-[5px] bg-[#F3FAF7] text-sm rounded-sm">
              {carts?.length}
            </p>
          </div>
          <div className="flex gap-5 items-center">
            <Icon src="/icon/i-list-2.svg" size={28} />
            <button
              onClick={() => clearCart()}
              className="flex gap-5 border-0  text-md font-semibold text-secondary  justify-center items-center p-1.25 bg-[#F3FAF7] text-sm rounded-sm cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
        {/* Cart Table */}
        <div className="max-h-60 w-full overflow-auto">
          {carts?.length > 0 ? (
            <Table
              headerClassName="sticky top-0 left-0"
              className="p-3.5 min-w-fit overflow-hidden"
              headers={tableHeaders}
            >
              {carts.map((data) => {
                return <CartTableRow key={data.id} data={data} />;
              })}
            </Table>
          ) : (
            <p className="text-orange-400">Your cart is empty!</p>
          )}
        </div>
        {/* Customer */}
        <div className="flex gap-4">
          <Input placeholder="Customer Name" />
          <Input placeholder="Phone" />
        </div>
        {/* Summary */}
        <BillingSummary
          discount={discount}
          setDiscount={setDiscount}
          delivery={delivery}
          setDelivery={setDelivery}
          subtotal={subtotal || 0}
          total={total || 0}
        />
        <Button
          disabled={carts.length === 0}
          onClick={() => setIsPaymentOpen(true)}
        >
          Pay {total} ৳
        </Button>
      </div>

      {/* Payment Modal */}
      {isPaymentOpen && (
        <PaymentModal
          onClose={() => setIsPaymentOpen(false)}
          orderPayload={orderPayload}
          onRightSideClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default RightSide;

function CartTableRow({ data }: { data: CartType }) {
  const { removeCart, decrementCartQty, incrementCartQty } = useCart();
  return (
    <tr>
      {/* Product Name */}
      <Td className="whitespace-nowrap p-3.5 truncate">{data.name}</Td>

      {/* Quantity */}
      <Td className="whitespace-nowrap p-3.5 text-center min-w-30">
        <div className="flex gap-4 justify-center items-center">
          <Icon
            src="/icon/i-minus.svg"
            size={14}
            onClick={() => decrementCartQty(data, 1)}
          />

          <input
            type="number"
            value={data.qty}
            readOnly
            className="py-1 w-8 text-center rounded-sm text-black border-0 focus:outline-0 max-w-[30px] max-h-[30px] no-spinner overflow-auto text-sm bg-[#F3FAF7]"
          />

          <Icon
            src="/icon/i-plus-border.svg"
            size={14}
            onClick={() => incrementCartQty(data, 1)}
          />
        </div>
      </Td>

      {/* Price */}
      <Td className="whitespace-nowrap p-3.5">{data.price * data.qty}</Td>

      {/* Delete */}
      <Td className="mx-auto">
        <Icon
          src="/icon/i-delete.svg"
          className="cursor-pointer"
          onClick={() => removeCart(data.id)}
        />
      </Td>
    </tr>
  );
}

// ---- Billing Summary Component ----
type BillingSummaryProps = {
  discount: number;
  setDiscount: (val: number) => void;
  delivery: number;
  setDelivery: (val: number) => void;
  subtotal: number;
  total: number;
};

function BillingSummary({
  discount,
  setDiscount,
  delivery,
  setDelivery,
  subtotal = 0,
  total = 0,
}: BillingSummaryProps) {
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);

  return (
    <div className="pb-5">
      <table className="w-full">
        <tbody className="space-y-8">
          {/* Discount */}
          <tr>
            <td className="text-sm font-medium text-secondary p-0 pb-8">
              Discount
            </td>
            <td className="p-0 pb-8 text-center">:</td>
            <td className="text-right text-sm text-body-text p-0 pb-8">
              <div className="ml-auto max-w-fit flex items-center gap-2 justify-end">
                {isDiscountOpen && (
                  <Input
                    className="max-w-24 px-1.5"
                    type="number"
                    defaultValue={discount}
                    getInputValue={(val) => setDiscount(Number(val))}
                  />
                )}

                {isDiscountOpen ? (
                  <button
                    className="cursor-pointer text-xl"
                    onClick={() => setIsDiscountOpen(false)}
                  >
                    ✔️
                  </button>
                ) : (
                  <Icon
                    src="/icon/i-pen.svg"
                    size={14}
                    className="cursor-pointer"
                    onClick={() => setIsDiscountOpen(true)}
                  />
                )}

                {!isDiscountOpen && <span>{discount} Tk</span>}
              </div>
            </td>
          </tr>

          {/* Delivery */}
          <tr>
            <td className="text-sm font-medium text-secondary p-0 pb-8">
              Delivery
            </td>
            <td className="p-0 pb-8 text-center">:</td>
            <td className="text-right text-sm text-body-text p-0 pb-8">
              <div className="ml-auto max-w-fit flex items-center gap-2 justify-end">
                {isDeliveryOpen && (
                  <Input
                    className="max-w-24 px-1.5"
                    type="number"
                    defaultValue={delivery}
                    getInputValue={(val) => setDelivery(Number(val))}
                  />
                )}

                {isDeliveryOpen ? (
                  <button
                    className="cursor-pointer text-xl"
                    onClick={() => setIsDeliveryOpen(false)}
                  >
                    ✔️
                  </button>
                ) : (
                  <Icon
                    src="/icon/i-pen.svg"
                    size={14}
                    className="cursor-pointer"
                    onClick={() => setIsDeliveryOpen(true)}
                  />
                )}

                {!isDeliveryOpen && <span>{delivery} Tk</span>}
              </div>
            </td>
          </tr>

          {/* Subtotal */}
          <tr>
            <td className="text-sm font-medium text-secondary p-0 pb-8">
              Subtotal
            </td>
            <td className="p-0 pb-8 text-center">:</td>
            <td className="text-right text-sm text-body-text p-0 pb-8">
              {subtotal} Tk
            </td>
          </tr>

          {/* Payable */}
          <tr className="border-t border-dashed">
            <td className="text-xl font-semibold pt-8 pb-0 text-secondary">
              Payable Amount
            </td>
            <td className="text-primary pt-8 pb-0 text-center">:</td>
            <td className="text-right text-xl font-semibold text-secondary pt-8 pb-0">
              {total} Tk
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
