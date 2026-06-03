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
  StatusButton,
} from "@/app/_components";
import Table, { TableSkeleton, Td } from "@/app/_components/ui/Table";

import { useSearchParams } from "next/navigation";
import useFetchWAuth from "@/app/_hooks/useAuthFetch";
import { ErrorMessage, NotFoundMessage } from "@/app/_components/ui/Alert";

import { formatDate, getOrderStatusColor, getSerial } from "@/app/_lib/utils";
import { OrderStatus, PaymentMethod } from "@/app/_types/types";
import Image from "next/image";
import { ORDER_TRACKING_OPTIONS, PAYMENT_METHOD } from "@/app/_constants";
import Dropdown, { DropdownItem } from "@/app/_components/ui/Dropdown";
import { toast } from "react-toastify";
import { putJSONData } from "@/app/_actions";

const headers: HeaderType[] = [
  { label: "SL." },
  { label: "ID", key: "id" },
  { label: "Date", key: "created_at" },
  { label: "Note", key: "note" },
  { label: "Total", key: "total" },
  { label: "Status", key: "status" },
  { label: "Payment Method", key: "payment_method" },
  { label: "View", align: "center" },
  { label: "Action", align: "center" },
];

type OrderType = {
  id: number;
  name: string;
  created_at: Date;
  total: number;
  status: OrderStatus;
  payment_method: PaymentMethod;
};

export default function OnlineSold() {
  // 🔹 get page from URL

  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const search = searchParams.get("search");
  let endpoint = `/orders/online?page=${page}`;
  if (search) endpoint += `&search=${search}`;

  const { data, isLoading, status, error, fetcher } = useFetchWAuth<{
    count: number;
    data: OrderType[];
  }>({
    endpoint: endpoint,
    isChange: [page, search],
  });

  // handle order status
  const handleOrderStatus = async (id: number, status: OrderStatus) => {
    const toastId = toast.loading("Updating order status...");
    const res = await putJSONData({
      endpoint: `/orders/${id}/status/`,
      formData: { status },
    });
    toast.done(toastId);
    if (res?.status === "success") {
      fetcher();
      toast.success("Order status updated!");
    } else {
      toast.error(res?.message || "Failed to update order status.");
    }
  };

  let content;
  if (isLoading) content = <TableSkeleton />;
  else if (!isLoading && status === "error")
    content = <ErrorMessage message={error || "Failed to load data."} />;
  else if (!isLoading && status === "success" && data?.count === 0)
    content = <NotFoundMessage message="Order not found." />;
  else
    content = (
      <>
        <Table headers={headers}>
          {data?.data?.map((Order: OrderType, index: number) => {
            const { id, name, created_at, total, status, payment_method } =
              Order;
            return (
              <tr key={id}>
                <Td>{getSerial(page, index)}</Td>
                <Td>{id}</Td>
                <Td>{formatDate(created_at)}</Td>
                <Td>{name}</Td>
                <Td>{total}</Td>
                <Td>
                  <StatusButton className={getOrderStatusColor(status)}>
                    {status?.split("_").join(" ")}
                  </StatusButton>
                </Td>
                <Td>
                  <div className="flex gap-2 items-center">
                    <Image
                      src={
                        PAYMENT_METHOD.find((v) => v.value === payment_method)
                          ?.img || "/placeholder-img.svg"
                      }
                      width={24}
                      height={24}
                      className="w-6 object-contain"
                      alt={payment_method}
                    />
                    <span className="capitalize"> {payment_method}</span>
                  </div>
                </Td>
                <Td className={"text-center"}>
                  <div className="inline-flex gap-5 min-w-max">
                    <Icon src="/icon/i-eye-view.svg" size={24} />
                  </div>
                </Td>
                <Td className="text-center">
                  <div className="flex gap-2.5">
                    <Dropdown
                      className="p-0 border-0"
                      label={
                        <StatusButton
                          className={
                            "border py-2 bg-transparent border-[#42D42A] text-[#42D42A]"
                          }
                        >
                          Update Info
                        </StatusButton>
                      }
                    >
                      <div className="flex flex-col p-2">
                        {ORDER_TRACKING_OPTIONS.map((track) => {
                          return (
                            <DropdownItem
                              key={track.label}
                              onClick={() =>
                                handleOrderStatus(
                                  id,
                                  track.value as OrderStatus,
                                )
                              }
                            >
                              {track.label}
                            </DropdownItem>
                          );
                        })}
                      </div>
                    </Dropdown>

                    <StatusButton
                      onClick={() => handleOrderStatus(id, "cancelled")}
                      className={
                        "border py-1.5 bg-transparent border-red-500 text-red-500"
                      }
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
          title="Online Sold"
          quantity={data?.count || 0}
        ></PageTopBar>

        <div className="card-wrapper space-y-6">
          <div className="flex gap-6 items-center justify-between flex-wrap">
            <Search />
            <div className="flex gap-6 items-center">
              <ExportTable
                headers={headers}
                tableData={data?.data}
                filename={`online_sold_page_${page}`}
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
