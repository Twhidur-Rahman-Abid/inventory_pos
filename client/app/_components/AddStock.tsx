"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { ChangeEvent, useRef, useState } from "react";
import { toast } from "react-toastify";

import { postJSONData } from "@/app/_actions";
import { useActionFetch } from "@/app/_hooks/useActionFetch";
import { fetchBranch } from "@/app/_actions/fetch_data";
import Modal from "./ui/Modal";
import Select from "./ui/Select";
import Icon from "./ui/Icon";
import Button from "./ui/Button";
import Loading from "./ui/Loading";
import { ProductType } from "../_types/types";
import Input from "./ui/Input";
import { debounce } from "../_lib/utils";
import useFetchWAuth from "../_hooks/useAuthFetch";
import { IMGBASE_URL } from "../_constants";
interface Product {
  sku_code: string;
  name: string;
  thumbnail?: string;
  id: number;
  quantity: number;
}

interface SelectedItems extends Product {
  qty: number;
}

type Item = {
  product_id: number;
  quantity: number;
};

type ProductResponse = {
  data: Product[];
  count: number;
};

const AddStock = ({
  type = "add",
  onClose = () => {},
  selectedProduct = {} as ProductType,
  fetcher = () => {},
}) => {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [branch_id, setBranchId] = useState<number>();
  const [invoice_no, setInvoiceNo] = useState<string>();
  const [SelectedItems, setSelectedItems] = useState<SelectedItems[]>([]);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [search, setSearch] = useState("");

  const debouncedSearchRef = useRef(
    debounce((val: string) => {
      setSearch(val);
    }, 500),
  );

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInputValue(value);
    debouncedSearchRef.current(value);
  };

  const {
    data: products,
    isLoading: productsLoading,
    status,
    error,
  } = useFetchWAuth<ProductResponse>({
    endpoint: `/products/sku?search=${search}`,
    isFetch: !!search,
    isChange: [search],
  });

  // handle selected item
  const handleSelectedItems = (item: Product) => {
    setSelectedItems((prev) => {
      const existItem = prev.find((i) => i.id === item.id);
      if (existItem) {
        toast.error(`${item.name} already added! increment qty`);
        return prev;
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  console.log(!!search, search, products, "search");

  const handleQuantity = (quantity: number, product_id: number) => {
    const product = SelectedItems.find(
      (si) => si.id === product_id,
    ) as SelectedItems;
    const currentStock = Number(product.quantity);
    if (quantity < 1) {
      toast.warning("Sorry, you can’t reduce the quantity below 1.");
      return;
    }
    if (type === "send" && quantity > currentStock) {
      toast.warning("Sorry, you can’t add more than the available stock.");
      return;
    }
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === product.id ? { ...item, qty: quantity } : item,
      ),
    );
  };

  const { data } = useActionFetch(fetchBranch);
  const branchData = data ?? [];

  const submitDisabled =
    isLoading ||
    productsLoading ||
    SelectedItems.length === 0 ||
    (type === "add" && !invoice_no) ||
    (type === "send" && !branch_id);

  const onSubmit = async () => {
    const items = SelectedItems.map((item) => ({
      product_id: item.id,
      quantity: item.qty,
    }));
    if (type === "add" && (!invoice_no || items.length === 0)) {
      toast.error(
        "Please provide invoice number and select at least one product.",
      );
      return;
    }
    setIsLoading(true);

    const endpoint = type === "add" ? `/stocks/inbounds` : `/stocks/send`;

    const res = await postJSONData({
      endpoint,
      formData: {
        invoice_no,
        branch_id,
        items,
      },
    });
    if (res?.status === "success") {
      toast.success(
        `${type === "add" ? "Stock added" : "Stock sent"} successfully!`,
      );
      setIsLoading(false);
      fetcher();
      onClose();
    } else {
      setIsLoading(false);
      toast.error(res?.message || "Something went wrong!");
    }
  };

  return (
    <Modal
      onClose={onClose}
      title={type === "add" ? "Add Stock" : "Send Stock"}
    >
      <div className="my-5 space-y-8">
        <div className="space-y-6">
          {type === "add" && (
            <div className="flex SelectedItems-center gap-10">
              <p className="text-secondary text-sm font-medium min-w-20">
                Invoice:
              </p>
              <Input
                placeholder="0001-NS-C"
                value={invoice_no}
                onChange={(e) => setInvoiceNo(e.target.value)}
              />
            </div>
          )}

          <div
            className={`flex ${searchInputValue?.length > 0 ? "items-start" : "items-center"} gap-10`}
          >
            <p className="text-secondary text-sm font-medium min-w-20">
              SKU/Code:
            </p>

            <div className="w-full">
              <Input
                placeholder="e.g. #9585759"
                value={searchInputValue}
                onChange={handleSearch}
              />

              {search &&
                (productsLoading ? (
                  <div className="mt-5">
                    <Loading />
                  </div>
                ) : products.count > 0 ? (
                  <>
                    <div className="max-h-28 overflow-y-scroll">
                      {products?.data?.map((product, i) => {
                        const { id, name, thumbnail, quantity } = product;
                        return (
                          <div
                            key={id}
                            className="p-1 mt-2 rounded-lg bg-[#f6f6f6] shadow-[0px_0px_1px_0px_rgba(0, 0, 0, 0.40)] flex SelectedItems-center"
                          >
                            <div className="w-10 h-9 bg-white border border-c-gray rounded-lg flex-center">
                              <Icon
                                src={
                                  thumbnail
                                    ? `${IMGBASE_URL}${thumbnail}`
                                    : "/placeholder-img.svg"
                                }
                                size={30}
                                className="aspect-square object-cover"
                              />
                            </div>
                            <p className="text-secondary text-12 ml-3">
                              {name} • {quantity}
                            </p>
                            <button
                              onClick={() => handleSelectedItems(product)}
                              className="ml-auto bg-[#42D42A] border border-[#1B9E05] rounded-lg px-1.5 py-1 text-white text-12 leading-3"
                            >
                              Add
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p>Product not found!</p>
                ))}
            </div>
          </div>

          {SelectedItems.length > 0 && (
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
                    <th>Qty</th>
                    <th className="px-3 py-1.5 text-12 font-black text-secondary border-l border-white">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {SelectedItems.map((item) => {
                    const { id, name, thumbnail, quantity, qty } = item;

                    return (
                      <tr
                        key={id}
                        className="bg-c-gray/40 border-b border-white"
                      >
                        <td className="px-3 py-1.5 border-r border-white ">
                          <Icon
                            src={
                              thumbnail
                                ? `${IMGBASE_URL}${thumbnail}`
                                : "/placeholder-img.svg"
                            }
                            size={30}
                            className="object-cover mx-auto "
                          />
                        </td>
                        <td className="px-3 py-1.5 border-r border-white  text-12 text-[#3D3D3D]">
                          {name}
                        </td>
                        <td className="px-3 py-1.5 border-r border-white  text-12 text-[#3D3D3D]">
                          {quantity}
                        </td>
                        <td className="px-3 py-1.5 border-r border-white  text-12 text-[#3D3D3D]">
                          <div className="flex gap-4 pb-2 border-b border-c-gray justify-center">
                            <Icon
                              src="/icon/i-minus.svg"
                              size={14}
                              onClick={() => handleQuantity(qty - 1, id)}
                            />
                            {/* <span className="px-2 py-1 rounded-sm text-black text-sm bg-[#F3FAF7]">
              5
            </span> */}
                            <input
                              className="text-center py-1 w-8  rounded-sm text-black text-sm bg-[#F3FAF7] appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              // value={selectedProduct?.quantity || 0}
                              value={qty}
                              type="number"
                              name="quantity"
                              min={1}
                              max={selectedProduct?.quantity}
                              onChange={(e) =>
                                handleQuantity(Number(e.target.value), id)
                              }
                            />
                            <Icon
                              src="/icon/i-plus-border.svg"
                              size={14}
                              onClick={() => handleQuantity(qty + 1, id)}
                            />
                          </div>
                        </td>
                        <td className="px-3 py-1.5 border-l border-white  ">
                          <Icon
                            className="mx-auto"
                            src="/icon/i-delete.svg"
                            size={14}
                            //   onClick={handleDelete}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {type === "send" && (
            <div className="flex items-center gap-10 pb-2.5">
              <p className="text-secondary text-sm font-medium min-w-20">
                Branch:
              </p>
              <div className="w-full ">
                <Select
                  name={"branch_id"}
                  className="py-3.5"
                  options={branchData?.slice(1)}
                  getSelectValue={(value: string | number | undefined) => {
                    if (value === undefined) return setBranchId(undefined);
                    setBranchId(Number(value));
                  }}
                />
              </div>
            </div>
          )}

          <Button onClick={onSubmit} disabled={submitDisabled}>
            {isLoading ? (
              <Loading isBlack={true} />
            ) : type === "send" ? (
              "Send Stock"
            ) : (
              "Add Stock"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddStock;
