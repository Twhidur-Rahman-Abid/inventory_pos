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
              <div className="w-full grid place-items-center">
                <PrintInvoice
                  orderData={orderData}
                  onClose={onClose}
                  showOnly
                />
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
