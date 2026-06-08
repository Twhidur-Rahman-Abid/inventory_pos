"use client";

import { HeaderType } from "@/app/_lib/CommonTypes";
import {
  Button,
  ExportTable,
  Icon,
  ImportTable,
  PageTopBar,
  Pagination,
  Search,
  DeleteItem,
  StatusButton,
} from "@/app/_components";
import Table, { TableSkeleton, Td } from "@/app/_components/ui/Table";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import useFetchWAuth from "@/app/_hooks/useAuthFetch";
import { ErrorMessage, NotFoundMessage } from "@/app/_components/ui/Alert";
import ProductShowModal from "./ProductShow";
import ProductModal from "./ProductModal";
import { ProductType } from "@/app/_types/types";
import Image from "next/image";
import SendModal from "./SendModal";
import { MONEY_SYMBOL } from "@/app/_constants";

// Table header
const headers: HeaderType[] = [
  { label: "Sl.", key: "id" },
  { label: "Product Name", key: "name" },
  { label: "SKU", key: "sku_code" },
  { label: "Thumbnail" },
  { label: "Price", key: "price" },
  { label: "Stock", key: "quantity" },
  { label: "Actions", align: "center" },
];

export default function ProductPage() {
  // Product create and edit modal
  const [ModalOpen, setModalOpen] = useState<null | {
    editable?: Partial<ProductType>;
    open?: boolean;
  }>(null);

  // send to branch modal state
  const [sendData, setSendData] = useState({
    open: false,
    product: {} as ProductType,
  });

  // Product show modal
  const [productShow, setProductShow] = useState<{
    open: boolean;
    product?: ProductType;
  }>({ open: false });

  // 🔹 get page from URL
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const search = searchParams.get("search");
  let endpoint = `/stocks?page=${page}`;
  if (search) endpoint += `&search=${search}`;

  // Fetch product
  const { data, isLoading, status, error, fetcher } = useFetchWAuth<{
    count: number;
    data: ProductType[];
  }>({
    endpoint: endpoint,
    isChange: [page, search],
  });

  // Decide what to render based on fetch state
  let content;
  if (isLoading) content = <TableSkeleton />;
  else if (!isLoading && status === "error")
    content = <ErrorMessage message={error || "Failed to load data."} />;
  else if (!isLoading && status === "success" && data?.count === 0)
    content = <NotFoundMessage message="Product not found." />;
  else
    content = (
      <>
        <Table headers={headers}>
          {data?.data?.map((product: ProductType, index: number) => {
            const { id, name, sku_code, thumbnail, price, quantity } = product;
            return (
              <tr key={id}>
                <Td>{(page - 1) * 10 + index + 1}</Td>
                <Td>{name}</Td>
                <Td>{sku_code}</Td>
                <Td>
                  <Image
                    src={thumbnail || "/placeholder-img.svg"}
                    width={50}
                    height={50}
                    alt={name}
                    className="size-12"
                  />
                </Td>
                <Td>
                  {MONEY_SYMBOL}
                  {price}
                </Td>
                <Td>{quantity}</Td>

                <Td className={"text-center"}>
                  <div className="inline-flex gap-5 min-w-max">
                    <StatusButton
                      className="rounded-md"
                      onClick={() => setSendData({ open: true, product })}
                    >
                      Send
                    </StatusButton>
                    <Icon
                      onClick={() =>
                        setModalOpen({ editable: product, open: true })
                      }
                      src="/icon/i-edit-pen.svg"
                      size={24}
                    />
                    <Icon
                      src="/icon/i-eye-view.svg"
                      size={24}
                      onClick={() => setProductShow({ open: true, product })}
                    />
                    <DeleteItem
                      endpoint={`/products/${id}`}
                      fetcher={fetcher}
                      title={`${name} product`}
                    />
                  </div>
                </Td>
              </tr>
            );
          })}
        </Table>
      </>
    );

  return (
    <>
      <div className="space-y-7">
        <PageTopBar title="Products" quantity={data?.count || 0}>
          <Button
            className=" border-none px-3.5"
            onClick={() => setModalOpen({ open: true })}
          >
            ADD Product
            <Icon src="/icon/i-plus.svg" className="hidden md:inline-block" />
          </Button>
        </PageTopBar>

        {/* Search, Import and Exports table, Table content and pagination */}
        <div className="card-wrapper space-y-6">
          <div className="flex gap-6 items-center justify-between flex-wrap">
            <Search />

            {/* Import and Export */}
            <div className="flex gap-6 items-center">
              <ImportTable />
              <ExportTable
                headers={headers}
                tableData={data?.data}
                filename={`Products_page_${page}`}
              />
            </div>
          </div>
          {/* 🔹 Table */}

          {content}

          {/* 🔹 Pagination */}
          <Pagination count={data.count} />
        </div>
      </div>
      {/* Product create and edit Modal */}
      {ModalOpen?.open && (
        <ProductModal
          onClose={() => setModalOpen(null)}
          fetcher={fetcher}
          editable={ModalOpen?.editable}
        />
      )}

      {/* product show */}
      {productShow.open && (
        <ProductShowModal
          onClose={() => setProductShow({ open: false })}
          product={productShow?.product || ({} as ProductType)}
          refetchProduct={fetcher}
        />
      )}

      {/* Send product to branch */}
      {sendData.open && sendData.product?.id && (
        <SendModal
          onClose={() => {
            setSendData({ open: false, product: {} as ProductType });
          }}
          selectedProduct={sendData.product}
          fetcher={fetcher}
        />
      )}
    </>
  );
}
