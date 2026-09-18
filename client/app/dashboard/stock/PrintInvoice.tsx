/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Logo, LogoIcon } from "@/app/_components";
import { useUser } from "@/app/_context/userContext";
import { cn, formatDate } from "@/app/_lib/utils";
import Image from "next/image";
import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { StockTransferType } from "./page";

const PrintInvoice = ({
  orderData = {} as StockTransferType,
  onClose = () => {},
  showOnly = false,
}: {
  orderData?: StockTransferType;
  onClose?: () => void;
  showOnly?: boolean;
}) => {
  console.log("orderData:", orderData);
  // Invoice Print
  const invoiceRef = useRef<HTMLDivElement>(null);

  const { user } = useUser();

  // Handle order data print
  const handleOrderPrint = useReactToPrint({
    contentRef: invoiceRef,
    onAfterPrint: () => {
      onClose();
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

  const handleClick = async () => {
    handleOrderPrint();
  };

  return (
    <>
      {!showOnly && (
        <Button className="cursor-pointer" onClick={handleClick}>
          Print
          <Image
            src="/icon/i-print.svg"
            width={32}
            height={32}
            className="size-8 filter invert brightness-0"
            alt="Print Invoice"
          />
        </Button>
      )}
      {/* Order Voucher for print */}
      {orderData && (
        <div className={cn("hidden", showOnly && "block")}>
          {/* <OrderVoucher ref={componentRef} order={orderData} /> */}
          <div
            ref={invoiceRef}
            className="max-w-fit p-4 print:max-w-none print:mx-0 print:p-0 relative z-10"
          >
            <LogoIcon className="size-75 absolute top-1/2 left-1/2 -translate-1/2 opacity-10" />
            <div className="p-4 print:max-w-none print:mx-0 print:p-0 z-20">
              <div className="w-full bg-white border border-gray-300 print:border-gray-800">
                {/* Header */}
                <div className="py-6 px-6 border-b border-gray-300 print:border-gray-800 flex items-start justify-between">
                  <Logo />

                  <div className="space-y-2 text-right">
                    <h1 className="text-2xl font-bold text-gray-900 uppercase">
                      Transfer INVOICE
                    </h1>

                    <p className="text-sm text-gray-600">
                      NS-{orderData?.branch?.name}-{orderData?.id}
                    </p>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Items Table */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-base text-gray-900 border-b border-gray-300 print:border-gray-800 pb-2">
                      Items Transferred
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
                                {item.quantity}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Separator */}
                  <div className="border-t border-gray-300 print:border-gray-800"></div>

                  {/* Separator */}
                  <div className="border-t border-gray-300 print:border-gray-800"></div>

                  {/* Footer */}
                  <div className="flex justify-between gap-4 text-center space-y-2 pt-2">
                    <div className="flex-1 text-left">
                      <div className="flex gap-2">
                        <p className="text-sm font-medium">📍</p>
                        <p className="text-sm font-medium text-gray-900">
                          Railway Station Road,Hathazari,Chittagong
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ☎️ +880 1740-717473
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        🌐 niamhashop.com
                      </p>
                    </div>
                    <div className="text-right flex-1">
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
        </div>
      )}
    </>
  );
};

export default PrintInvoice;
