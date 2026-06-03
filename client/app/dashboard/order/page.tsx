import React from "react";
import CategorySlider from "./_components/CategorySlider";
import ProductList from "./_components/ProductList";
import RightSide from "./_components/RightSide";
import { ProductOrderCartProvider } from "@/app/_context/productOrderCartContext";

const OrderPage = () => {
  return (
    <ProductOrderCartProvider>
      <div className="flex justify-between w-full">
        <div className=" overflow-hidden pt-10 lg:pr-6 flex-1">
          <CategorySlider />
          <ProductList />
        </div>

        {/* right side */}
        <RightSide />
      </div>
    </ProductOrderCartProvider>
  );
};

export default OrderPage;
