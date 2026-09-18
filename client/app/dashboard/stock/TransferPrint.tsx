/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button, Icon, Modal } from "@/app/_components";

import React, { useState } from "react";

import { StockTransferType } from "./page";
import PrintInvoice from "./PrintInvoice";

const TransferPrint = ({ data }: { data: StockTransferType }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClose = () => setIsOpen(false);

  const handleClick = () => {
    setIsOpen(true);
  };

  return (
    <>
      <button className="cursor-pointer" onClick={() => handleClick()}>
        <Icon src="/icon/i-print.svg" size={32} />
      </button>

      {isOpen && (
        <Modal title="Order Details" onClose={onClose}>
          <div className="w-full grid place-items-center">
            <PrintInvoice orderData={data} onClose={onClose} showOnly />
          </div>
          <div className="flex gap-6 items-center justify-between mt-4">
            <Button onClick={onClose} isCancel>
              Close
            </Button>
            <PrintInvoice orderData={data} onClose={onClose} />
          </div>
        </Modal>
      )}
    </>
  );
};

export default TransferPrint;
