"use client";
import React, { useRef, useState } from "react";

import Barcode from "react-barcode";

import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import { Button, Input, Modal } from "@/app/_components";
import Image from "next/image";
import Loading from "@/app/_components/ui/Loading";
import { putJSONData } from "@/app/_actions";
import { ProductType } from "@/app/_types/types";

const ProductShowModal = ({
  onClose,
  product,
  refetchProduct,
}: {
  onClose: () => void;
  product: ProductType;
  refetchProduct: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStock, setCurrentStock] = useState();
  const [printCount, setPrintCount] = useState(1);
  const barcodeRef = useRef(null);

  const { id, sku_code, name, price, quantity, thumbnail } = product;

  // Handle add stock
  const handleAddStock = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentStock) {
      toast.error("Current Stock is required");
      return;
    }

    setIsLoading(true);
    const res = await putJSONData({
      endpoint: `/products/${id}/add-stock/`,
      formData: {
        quantity: currentStock,
      },
    });

    if (res?.status === "success") {
      setIsLoading(false);
      onClose();
      toast.success("Set current successfully!");
      refetchProduct();
    } else {
      setIsLoading(false);
      toast.error(res?.message || "There was an error");
    }
  };

  // handle print barcode
  const handlePrintBarcode = useReactToPrint({
    contentRef: barcodeRef,
    pageStyle: `
      @page {
        size: 40mm 34mm;  /* Adjust to match barcode size */
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

  return (
    <Modal title={"Product Details"} onClose={onClose}>
      {/* Product details */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        <ProductInfo title="Product Name" data={name} />
        <ProductInfo title="Product Sku" data={sku_code} />
        <ProductInfo title="Selling Price" data={price} />
        <ProductInfo title="Current Stock" data={quantity} />
      </div>

      {/* Product DP */}
      <div className="flex gap-6 items-center mt-6">
        <Image
          className="basis-1/2 size-44 object-contain"
          src={thumbnail || "/placeholder-img.svg"}
          alt={name}
          width={176}
          height={176}
        />

        <div className="basis-1/2">
          {/* ✅ Hidden template barcode to reference */}
          <div className="hidden print:flex flex-wrap">
            <div ref={barcodeRef}>
              <Barcode value={sku_code} format="CODE128" width={1.5} />
            </div>
          </div>
          {/* 👁️ Preview one barcode */}

          {/* <div className="w-[150px] h-[100px] flex items-center justify-center bg-white"> */}
          <Barcode value={sku_code} format="CODE128" width={1.5} height={80} />
          {/* </div> */}
          <div className="hidden print:block" ref={barcodeRef}>
            {Array.from({ length: printCount }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-center size-full page-break"
              >
                <Barcode
                  value={sku_code}
                  format="CODE128"
                  width={1.5}
                  height={80}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🖨️ Barcode print input and button */}
      <div className="flex gap-6 items-center mt-6">
        <Input
          type="number"
          placeholder="How many barcode to print?"
          className="w-full"
          min={1}
          getInputValue={(value) => setPrintCount(Number(value))}
        />

        <Button onClick={handlePrintBarcode} type="button" className="w-fit ">
          Print Barcode
        </Button>
      </div>

      {/* Add Stock form */}
      <form onSubmit={handleAddStock} className="flex gap-6 items-center mt-6">
        <input type="text" hidden defaultValue={sku_code} name="sku_code" />
        <Input
          type="number"
          placeholder="Add new stock"
          className="w-full"
          name="quantity"
          required={true}
          getInputValue={(value) => setCurrentStock(value)}
        />
        <Button
          disabled={!currentStock || isLoading}
          type="submit"
          className="w-fit"
        >
          {isLoading ? <Loading /> : "Add Stock"}
        </Button>
      </form>
    </Modal>
  );
};

export default ProductShowModal;

function ProductInfo({
  title,
  data,
}: {
  title: string;
  data: string | number;
}) {
  return (
    <p className="text-gray-600 text-lg">
      {title}: <span className="font-medium text-secondary">{data}</span>
    </p>
  );
}
