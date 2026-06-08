"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import useFetchWAuth from "../../_hooks/useAuthFetch";
import { toast } from "react-toastify";
import Modal from "../../_components/ui/Modal";

import Loading from "../../_components/ui/Loading";
import Image from "next/image";
import Select from "../../_components/ui/Select";
import Icon from "../../_components/ui/Icon";
import Button from "../../_components/ui/Button";
import { BranchType, ProductType } from "../../_types/types";
import { postJSONData } from "@/app/_actions";

const SendModal = ({
  onClose = () => {},
  selectedProduct = {} as ProductType,
  fetcher = () => {},
}) => {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [branch_id, setBranchId] = useState<number>();
  const [branchOption, setBranchOption] = useState<
    {
      value: string | number;
      label: string;
    }[]
  >([{ value: "hidden", label: "Select Branch..." }]);

  const [quantity, setQuantity] = useState(0);

  const handleQuantity = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    const currentStock = Number(selectedProduct?.quantity);
    if (value > currentStock) {
      toast.warning("Sorry, you can’t add more than the available stock.");
      // setQuantity((prev) => prev);
      return;
    }
    setQuantity(Number(e.target.value));
    if (value === 1) {
      toast.warning("Sorry, you can’t reduce the quantity below 1.");
      setQuantity((prev) => prev);
    }
  };

  const incrementQuantity = () => {
    console.log(selectedProduct?.quantity);
    if (!selectedProduct?.quantity) {
      toast.warning("Select product");
      return;
    }
    if (quantity == selectedProduct?.quantity) {
      toast.warning("Sorry, you can’t add more than the available stock.");
      return;
    }
    setQuantity((prev) => Number(prev) + 1);
  };

  const decrementQuantity = () => {
    if (quantity == 1) {
      toast.warning("Sorry, you can’t reduce the quantity below 1.");
      return;
    }
    setQuantity((prev) => Number(prev) - 1);
  };

  const { data: branchData } = useFetchWAuth<BranchType[]>({
    endpoint: "/branches",
  });

  // fetch branch
  useEffect(() => {
    let ignore = false;
    if (branchData?.length > 0) {
      if (!ignore) {
        const newBranch = branchData.map((b) => ({
          label: b.name,
          value: b.id,
        }));
        setBranchOption((prev) => [...prev, ...newBranch]);
      }
    }

    return () => {
      ignore = true;
    };
  }, [branchData]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (quantity === 0 || !selectedProduct?.name) {
      toast.error("Select product to send");
      return;
    }
    setIsLoading(true);

    if (!branch_id) {
      toast.error("Select branch");
      return;
    }

    if (!quantity) {
      toast.error("Add quantity!");
      return;
    }

    const res = await postJSONData({
      endpoint: `/stocks/send`,
      formData: {
        product_id: selectedProduct.id,
        quantity,
        branch_id,
      },
    });
    if (res?.status === "success") {
      toast.success(`Send product successfully!`);
      setIsLoading(false);
      fetcher();
      onClose();
    } else {
      setIsLoading(false);
      toast.error(res?.message || "Something went wrong!");
    }
  };

  return (
    <Modal onClose={onClose} title={"Send to Branch"}>
      <div className="my-5 space-y-8">
        {selectedProduct?.name && (
          <div className="rounded-lg border border-c-gray w-full max-h-38 overflow-auto ">
            <table className="w-full ">
              <thead>
                <tr className="bg-c-gray">
                  <th className="px-3 py-1.5 text-12  font-black text-secondary border-r border-white">
                    Image
                  </th>
                  <th className="px-3 py-1.5 text-12 text-left font-black text-secondary border-r border-white">
                    Product Name
                  </th>
                  <th className="px-3 py-1.5 text-12 text-left font-black text-secondary border-r border-white">
                    Current Stock
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr className="bg-c-gray/40 border-b border-white">
                  <td className="px-3 py-1.5 border-r border-white ">
                    <Image
                      src={selectedProduct?.thumbnail || "/placeholder-img.svg"}
                      width={30}
                      height={30}
                      alt={selectedProduct?.name}
                      className="object-cover mx-auto "
                    />
                  </td>
                  <td className="px-3 py-1.5 border-r border-white  text-12 text-[#3D3D3D]">
                    {selectedProduct?.name}
                  </td>
                  <td className="px-3 py-1.5 border-r border-white  text-12 text-[#3D3D3D]">
                    {selectedProduct?.quantity}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <form action="" onSubmit={onSubmit} className="space-y-6">
          <div className="flex items-center gap-10">
            <p className="text-secondary text-sm font-medium min-w-20">
              Branch:
            </p>
            <Select
              name={"branch_id"}
              className="py-3.5"
              options={branchOption}
              getSelectValue={(value: string | number | undefined) => {
                if (value === undefined) return setBranchId(undefined);
                setBranchId(Number(value));
              }}
            />
          </div>
          <div className="flex items-center gap-10">
            <p className="text-secondary text-sm font-medium min-w-20">
              Quantity:
            </p>
            <div className="flex gap-4 pb-2 border-b border-c-gray justify-center">
              <Icon
                src="/icon/i-minus.svg"
                size={14}
                onClick={decrementQuantity}
              />
              {/* <span className="px-2 py-1 rounded-sm text-black text-sm bg-[#F3FAF7]">
              5
            </span> */}
              <input
                className="text-center py-1 w-8  rounded-sm text-black text-sm bg-[#F3FAF7] appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                // value={selectedProduct?.quantity || 0}
                value={quantity}
                type="number"
                name="quantity"
                min={1}
                max={selectedProduct?.quantity}
                onChange={handleQuantity}
              />
              <Icon
                src="/icon/i-plus-border.svg"
                size={14}
                onClick={incrementQuantity}
              />
            </div>
          </div>
          <Button type="submit">
            {isLoading ? <Loading isBlack={true} /> : "Send"}
          </Button>
        </form>
      </div>
    </Modal>
  );
};

export default SendModal;
