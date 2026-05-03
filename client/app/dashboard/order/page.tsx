import React from "react";
import CategorySlider from "./_components/CategorySlider";
import ProductList from "./_components/ProductList";
import RightSide from "./_components/RightSide";

const OrderPage = () => {
  return (
    <>
      <div className="flex justify-between w-full">
        <div className=" overflow-hidden pt-10 lg:pr-6">
          <CategorySlider />
          <ProductList />
        </div>

        {/* right side */}
        <RightSide />
      </div>
    </>
  );
};

export default OrderPage;
