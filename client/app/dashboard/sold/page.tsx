/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { HeaderType } from "@/app/_lib/CommonTypes";
import {
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
import { PAYMENT_METHOD } from "@/app/_constants";
import PrintInvoice from "./PrintInvoice";

const headers: HeaderType[] = [
  { label: "SL." },
  { label: "ID", key: "id" },
  { label: "Date", key: "created_at" },
  { label: "Note", key: "note" },
  { label: "Cash", key: "cash_amount" },
  { label: "Other Amount", key: "payment_method", align: "center" },
  { label: "Total", key: "total" },
  { label: "View", align: "center" },
];

type OrderType = {
  id: number;
  name: string;
  created_at: Date;
  total: number;
  status: OrderStatus;
  cash_amount: number;
  other_payment_amount?: number;
  other_payment_method?: string;
  note?: string;
};

export default function SoldPage() {
  // 🔹 Search and pagination
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const search = searchParams.get("search");
  let endpoint = `/orders?page=${page}`;
  if (search) endpoint += `&search=${search}`;

  // fetch order data
  const { data, isLoading, status, error } = useFetchWAuth<{
    count: number;
    data: OrderType[];
  }>({
    endpoint: endpoint,
    isChange: [page, search],
  });

  // Decide what to render based on the fetch status
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
            const {
              id,
              cash_amount,
              other_payment_amount,
              other_payment_method,
              note,
              created_at,
              total,
            } = Order;
            return (
              <tr key={id}>
                <Td>{getSerial(page, index)}</Td>
                <Td>{id}</Td>
                <Td>{formatDate(created_at)}</Td>
                <Td>
                  <p className="max-w-40 text-wrap">{note}</p>
                </Td>

                <Td>{cash_amount}</Td>
                <Td>
                  <div className="flex gap-2 items-center  justify-center">
                    {other_payment_method && (
                      <Image
                        src={
                          PAYMENT_METHOD.find(
                            (v) => v.value === other_payment_method,
                          )?.img || "/placeholder-img.svg"
                        }
                        width={32}
                        height={32}
                        className="w-8 object-contain"
                        alt={other_payment_method || ""}
                      />
                    )}
                    <span className="capitalize text-center ">
                      {other_payment_amount || "N/A"}
                    </span>
                  </div>
                </Td>
                <Td>{total}</Td>
                <Td className={"text-center"}>
                  <PrintInvoice id={id} />
                </Td>
              </tr>
            );
          })}
        </Table>
      </>
    );

  return (
    <>
      {/* page content */}

      <div className="space-y-7">
        <PageTopBar title="Sold" quantity={data?.count || 0}></PageTopBar>

        <div className="card-wrapper space-y-6">
          <div className="flex gap-6 items-center justify-between flex-wrap">
            <Search />
            <div className="flex gap-6 items-center">
              <ExportTable
                headers={headers}
                tableData={data?.data}
                filename={`offline_sold_page_${page}`}
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
