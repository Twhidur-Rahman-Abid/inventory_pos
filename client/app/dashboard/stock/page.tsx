"use client";

import { HeaderType } from "@/app/_lib/CommonTypes";
import {
  Button,
  ExportTable,
  PageTopBar,
  Pagination,
  Search,
  StatusButton,
} from "@/app/_components";
import Table, { TableSkeleton, Td } from "@/app/_components/ui/Table";

import { useSearchParams } from "next/navigation";
import useFetchWAuth from "@/app/_hooks/useAuthFetch";
import { ErrorMessage, NotFoundMessage } from "@/app/_components/ui/Alert";

import { formatDate, getOrderStatusColor, getSerial } from "@/app/_lib/utils";
import { OrderStatus } from "@/app/_types/types";
import Image from "next/image";
import { toast } from "react-toastify";
import { postJSONData } from "@/app/_actions";
import { Suspense, useState } from "react";

// stock transfer table header
const headers: HeaderType[] = [
  { label: "SL." },
  { label: "Product Name" },
  { label: "Thumbnail" },
  { label: "Quantity" },
  { label: "Status" },
  { label: "Date" },
  { label: "Action", align: "center" },
];

// stock transfer type
type StockTransferType = {
  id: number;
  created_at: string | Date;
  quantity: number;
  status: OrderStatus;
  product: {
    id: number;
    name: string;
    thumbnail?: string;
  };
};

export default function StockPage() {
  return (
    <Suspense>
      <StockTransfer />
    </Suspense>
  );
}

function StockTransfer() {
  const [actionLoading, setActionLoading] = useState(false);

  // accept stock
  const stockAction = async (id: number, type: "accept" | "cancel") => {
    setActionLoading(true);
    const ToastId = toast.loading("Stock accepting...");
    const res = await postJSONData({
      endpoint:
        type === "accept" ? `/stocks/${id}/accept` : `/stocks/${id}/cancel`,
      formData: null,
    });
    setActionLoading(false);
    toast.done(ToastId);

    if (res?.status === "success") {
      toast.success(type === "accept" ? "Accepted!" : "Canceled!");
      fetcher();
    } else {
      toast.error(res?.message);
    }
  };

  // 🔹 get page from URL
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || 1;

  const { data, isLoading, status, error, fetcher } = useFetchWAuth<{
    count: number;
    data: StockTransferType[];
  }>({
    endpoint: "/stocks/transfers",
    isChange: [page],
  });

  let content;
  if (isLoading) content = <TableSkeleton />;
  else if (!isLoading && status === "error")
    content = <ErrorMessage message={error || "Failed to load data."} />;
  else if (!isLoading && status === "success" && data?.count === 0)
    content = <NotFoundMessage message="Stock transfer not found." />;
  else
    content = (
      <>
        <Table headers={headers}>
          {data?.data?.map((Order: StockTransferType, index: number) => {
            const {
              id: transfer_id,
              created_at,
              quantity,
              status,
              product: { id, name, thumbnail },
            } = Order;
            return (
              <tr key={id}>
                <Td>{getSerial(1, index)}</Td>
                <Td>{name}</Td>

                <Td>
                  <Image
                    src={thumbnail || "/placeholder-img.svg"}
                    alt="name"
                    width={30}
                    height={30}
                  />
                </Td>
                <Td>{quantity}</Td>

                <Td>
                  <StatusButton className={getOrderStatusColor(status)}>
                    {status?.split("_").join(" ")}
                  </StatusButton>
                </Td>
                <Td>{formatDate(created_at)}</Td>

                <Td>
                  <div className="flex gap-3 w-full justify-center">
                    <StatusButton
                      disabled={actionLoading}
                      className="bg-green-600 rounded-sm"
                      onClick={() => stockAction(transfer_id, "accept")}
                    >
                      Accept
                    </StatusButton>
                    <StatusButton
                      disabled={actionLoading}
                      className="bg-red-600 rounded-sm"
                      onClick={() => stockAction(transfer_id, "cancel")}
                    >
                      Cancel
                    </StatusButton>
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
        <PageTopBar
          title="Stock Transfer"
          quantity={data?.count || 0}
        ></PageTopBar>

        <div className="card-wrapper space-y-6">
          <div className="flex gap-6 items-center justify-between flex-wrap">
            <div></div>
            <div className="flex gap-6 items-center">
              <ExportTable
                headers={headers}
                tableData={data?.data}
                filename={`stock_transfer${page}`}
              />
            </div>
          </div>
          {/* 🔹 Table */}

          {content}

          {/* 🔹 Pagination */}
          <Pagination count={data.count} />
        </div>
      </div>
    </>
  );
}
