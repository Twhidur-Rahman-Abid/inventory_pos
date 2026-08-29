/* eslint-disable @typescript-eslint/no-explicit-any */
import { getData } from "@/app/_actions";
import { Button, Icon, Logo, Modal } from "@/app/_components";
import PrintInvoice from "@/app/_components/PrintInvoice";
import Loading from "@/app/_components/ui/Loading";
import { MONEY_TITLE } from "@/app/_constants";
import { useUser } from "@/app/_context/userContext";
import { formatDate } from "@/app/_lib/utils";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { toast } from "react-toastify";

const OrderDetails = ({ id }: { id: number }) => {
  // Invoice Print
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const { user } = useUser();

  const onClose = () => setIsOpen(false);

  // Handle order data print
  const handleOrderPrint = useReactToPrint({
    contentRef: invoiceRef,
    onAfterPrint: () => {
      setOrderData(null);
      setReady(false);
    },
    pageStyle: `
      @page {
        size: 180mm 230mm;  /* Adjust to match barcode size */
        margin: 0;
      }
      body {
        margin: 0;
        -webkit-print-color-adjust: exact;
      }
      .page-break {
        page-break-after: always;
      }
    `,
  });

  const handleClick = async (id: number) => {
    setIsOpen(true);
    setIsLoading(true);
    const res = await getData(`/orders/${id}/details`);
    setIsLoading(false);
    if (res?.status === "success") {
      setOrderData({ ...res.data?.data });
      setReady(true);
    } else {
      toast.error(res?.message || "There was an error!");
    }
  };

  useEffect(() => {
    if (ready && orderData) {
      setTimeout(() => {
        handleOrderPrint();
      }, 100);
    }
  }, [ready, orderData]);

  return (
    <>
      <button className="cursor-pointer" onClick={() => handleClick(id)}>
        <Icon src="/icon/i-eye-view.svg" size={24} />
      </button>

      {isOpen && (
        <Modal title="Order Details" onClose={onClose}>
          {isLoading ? (
            <Loading />
          ) : (
            <>
              <div className="">
                {/* <OrderVoucher ref={componentRef} order={orderData} /> */}
                <div
                  // ref={invoiceRef}
                  className="max-w-md mx-auto p-4 print:max-w-none print:mx-0 print:p-0"
                >
                  <div className="max-w-md mx-auto p-4 print:max-w-none print:mx-0 print:p-0">
                    <div className="w-full bg-white border border-gray-300 print:border-gray-800">
                      {/* Header */}
                      <div className="py-6 px-6 border-b border-gray-300 print:border-gray-800 flex items-start justify-between">
                        <Logo />

                        <div className="space-y-2 text-right">
                          <h1 className="text-2xl font-bold text-gray-900">
                            ORDER INVOICE
                          </h1>

                          <p className="text-sm text-gray-600">Niamah Shop</p>
                        </div>
                      </div>

                      <div className="p-6 space-y-5">
                        {/* Order Info */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 font-medium">
                              Name:
                            </span>
                            <p className="font-mono text-xs mt-1 break-all text-gray-900">
                              {orderData?.customer_name}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600 font-medium">
                              Date:
                            </span>
                            <p className="mt-1 text-gray-900 font-semibold">
                              {formatDate(orderData?.created_at)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600 font-medium">
                              Phone:
                            </span>
                            <p className="font-mono text-xs mt-1 break-all text-gray-900">
                              {orderData?.customer_phone}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600 font-medium">
                              Branch:
                            </span>
                            <p className="mt-1 text-gray-900 font-semibold capitalize">
                              {user?.branch?.name}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-600 font-medium">
                              Note:
                            </span>
                            <p className="mt-1 text-gray-900 font-semibold capitalize">
                              {orderData?.note}
                            </p>
                          </div>
                        </div>

                        {/* Separator */}
                        <div className="border-t border-gray-300 print:border-gray-800"></div>

                        {/* Customer Info */}
                        {false && (
                          <>
                            <div className="space-y-3">
                              <h3 className="font-bold text-base text-gray-900 border-b border-gray-300 print:border-gray-800 pb-2">
                                Customer Details
                              </h3>
                              <div className="space-y-2">
                                <p className="text-base font-semibold text-gray-900">
                                  {orderData?.customer_name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {orderData?.customer_phone}
                                </p>
                              </div>
                            </div>

                            {/* Separator */}
                            <div className="border-t border-gray-300 print:border-gray-800"></div>
                          </>
                        )}

                        {/* Items Table */}
                        <div className="space-y-3">
                          <h3 className="font-bold text-base text-gray-900 border-b border-gray-300 print:border-gray-800 pb-2">
                            Items Ordered
                          </h3>
                          <div className="overflow-hidden border border-gray-300 print:border-gray-800">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gray-50 print:bg-gray-100 border-b border-gray-300 print:border-gray-800">
                                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-900">
                                    Product
                                  </th>
                                  <th className="text-center py-3 px-4 font-semibold text-sm text-gray-900">
                                    Qty
                                  </th>
                                  <th className="text-right py-3 px-4 font-semibold text-sm text-gray-900">
                                    Price
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {orderData?.items?.map((item: any) => (
                                  <tr
                                    key={item.id}
                                    className="border-b border-gray-200 print:border-gray-400 last:border-b-0"
                                  >
                                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                      {item?.product?.name}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-center text-gray-900">
                                      {item.qty}
                                    </td>
                                    <td className="py-3 px-4 text-sm font-semibold text-right text-gray-900">
                                      {item?.discounted_price}{" "}
                                      <span className="line-through">
                                        ({item?.price})
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Separator */}
                        <div className="border-t border-gray-300 print:border-gray-800"></div>

                        {/* Total */}
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              Delivery Charge:
                            </span>
                            <span className="text-gray-900 font-semibold">
                              {orderData?.delivery || 0} BDT
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              Extra Discount:
                            </span>
                            <span className="text-gray-900 font-semibold">
                              {orderData?.extra_discount} %
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Cash Amount:</span>
                            <span className="text-gray-900 font-semibold">
                              {orderData?.cash_amount}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {" "}
                              {orderData?.other_payment_method || "Other"}{" "}
                              Amount:
                            </span>
                            <span className="text-gray-900 font-semibold">
                              {orderData?.other_payment_amount}
                            </span>
                          </div>

                          <div className="flex justify-between text-xl font-bold border-t border-gray-300 print:border-gray-800 pt-3">
                            <span className="text-gray-900">Total Amount:</span>
                            <span className="text-gray-900">
                              {orderData?.total}
                            </span>
                          </div>
                        </div>

                        {/* Separator */}
                        <div className="border-t border-gray-300 print:border-gray-800"></div>

                        {/* Footer */}
                        <div className="text-center space-y-2 pt-2">
                          <p className="text-sm font-semibold text-gray-900">
                            Thank you for your order!
                          </p>
                          <p className="text-xs text-gray-600">
                            Order Reference: #{orderData?.id}
                          </p>
                          <p className="text-xs text-gray-500 mt-3">
                            Please keep this voucher for your records
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-6 items-center justify-between mt-4">
                <Button onClick={onClose} isCancel>
                  Close
                </Button>
                <PrintInvoice orderData={orderData} onClose={onClose} />
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  );
};

export default OrderDetails;
