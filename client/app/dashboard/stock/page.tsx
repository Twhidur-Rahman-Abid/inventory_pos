"use client";

import { HeaderType } from "@/app/_lib/CommonTypes";
import {
  Button,
  ExportTable,
  Icon,
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
import { useUser } from "@/app/_context/userContext";
import PrintInvoice from "./PrintInvoice";
import TransferPrint from "./TransferPrint";

// stock transfer table header
const headers: HeaderType[] = [
  { label: "SL." },
  { label: "Date" },
  { label: "Invoice No" },
  { label: "Product" },
  { label: "Status" },
  { label: "Action", align: "center" },
];

type product = {
  id: number;
  name: string;
  thumbnail?: string;
};

type Items = {
  id: number;
  quantity: number;
  product: product;
};

// stock transfer type
export type StockTransferType = {
  id: number;
  created_at: string | Date;
  status: OrderStatus;
  items: Items[];
  branch: {
    id: number;
    name: string;
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
  const { user } = useUser();
  const [refetch, setRefetch] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  const handleRefetch = () => setRefetch((prev) => (prev === 1 ? 2 : 1));

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

  let endpoint = `/stocks/transfers?page=${page}`;
  if (!["warehouse_manager", "admin"].includes(user?.role)) {
    endpoint += `&status_filter=pending`;
  }

  const { data, isLoading, status, error, fetcher } = useFetchWAuth<{
    count: number;
    data: StockTransferType[];
  }>({
    endpoint: endpoint,
    isChange: [page, refetch],
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
              items,
              status,
              branch,
            } = Order;
            return (
              <tr key={transfer_id}>
                <Td>{getSerial(1, index)}</Td>
                <Td>{formatDate(created_at)}</Td>
                <Td>{`NS-${branch?.name}-${transfer_id}`}</Td>

                <Td>
                  <div className="rounded-lg border border-c-gray w-full max-h-38 overflow-auto ">
                    <table className="w-full ">
                      <thead>
                        <tr className="bg-c-gray">
                          <th className="px-3 py-1.5 text-12  font-black text-secondary border-r border-white">
                            Product
                          </th>
                          <th className="px-3 py-1.5 text-12 text-left font-black text-secondary border-r border-white">
                            QTY
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {items.map((item) => (
                          <tr
                            key={item.id}
                            className="bg-c-gray/40 border-b border-white"
                          >
                            <td className="px-3 py-1.5 border-r border-white  text-12 text-[#3D3D3D]">
                              {item.product.name}
                            </td>
                            <td className="px-3 py-1.5 border-r border-white  text-12 text-[#3D3D3D]">
                              {item.quantity}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Td>

                <Td>
                  <StatusButton className={getOrderStatusColor(status)}>
                    {status?.split("_").join(" ")}
                  </StatusButton>
                </Td>

                <Td>
                  <div className="flex gap-3 w-full justify-center">
                    {["warehouse_manager", "admin"].includes(user?.role) ? (
                      <TransferPrint data={Order} />
                    ) : (
                      <>
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
                      </>
                    )}
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
            <div>
              <Button className="px-4" onClick={handleRefetch}>
                <Icon src="/icon/reload.svg" size={24} /> Reload
              </Button>
            </div>
            <div className="flex gap-6 items-center">
              {/* <ExportTable
                headers={headers}
                tableData={data?.data}
                filename={`stock_transfer${page}`}
              /> */}
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
