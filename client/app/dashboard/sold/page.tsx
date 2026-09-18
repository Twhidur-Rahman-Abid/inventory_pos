/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { HeaderType } from "@/app/_lib/CommonTypes";
import { ExportTable, PageTopBar, Pagination, Search } from "@/app/_components";
import Table, { TableSkeleton, Td } from "@/app/_components/ui/Table";

import { useSearchParams } from "next/navigation";
import useFetchWAuth from "@/app/_hooks/useAuthFetch";
import { ErrorMessage, NotFoundMessage } from "@/app/_components/ui/Alert";

import { formatDate, getSerial } from "@/app/_lib/utils";
import Image from "next/image";
import { PAYMENT_METHOD } from "@/app/_constants";
import PrintInvoice from "./PrintInvoice";
import DateFilter from "@/app/_components/DateFilter";

const headers: HeaderType[] = [
  { label: "SL." },
  { label: "ID", key: "id" },
  { label: "Date", key: "created_at" },
  { label: "Note", key: "note" },
  { label: "Cash", key: "cash_amount" },
  { label: "Other Method", key: "other_payment_method", isHide: true },
  { label: "Other Amount", key: "other_payment_amount", align: "center" },
  { label: "Delivery", key: "delivery" },
  { label: "Extra Discount", key: "extra_discount" },
  { label: "Discount Type", key: "is_percentage", isHide: true },
  { label: "Total", key: "total" },
  { label: "View", align: "center" },
];

type OrderType = {
  id: number;
  name: string;
  created_at: Date | string;
  total: number;
  cash_amount: number;
  other_payment_amount?: number | string;
  other_payment_method?: string;
  delivery?: number | string;
  extra_discount?: number;
  is_percentage?: boolean | string;
  note?: string;
};

export default function SoldPage() {
  // 🔹 Search and pagination
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const search = searchParams.get("search");
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");
  let endpoint = `/orders/basic?page=${page}`;
  if (search) endpoint += `&search=${search}`;
  if (startDate) endpoint += `&start_date=${startDate}`;
  if (endDate) endpoint += `&end_date=${endDate}`;

  // fetch order data
  const { data, isLoading, status, error } = useFetchWAuth<{
    count: number;
    data: OrderType[];
  }>({
    endpoint: endpoint,
    isChange: [page, search, startDate, endDate],
  });
  let orderedData: OrderType[] = [];

  // Decide what to render based on the fetch status
  let content;
  if (isLoading) content = <TableSkeleton />;
  else if (!isLoading && status === "error")
    content = <ErrorMessage message={error || "Failed to load data."} />;
  else if (!isLoading && status === "success" && data?.count === 0)
    content = <NotFoundMessage message="Order not found." />;
  else
    orderedData = data?.data.map((order) => ({
      ...order,
      created_at: formatDate(order.created_at),

      is_percentage: order.extra_discount
        ? order.is_percentage
          ? "Percent"
          : "Fixed"
        : "N/A",
    }));
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
            delivery,
            extra_discount,
            is_percentage,
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
              <Td>{delivery}</Td>
              <Td>
                {extra_discount ? (
                  <span>
                    {extra_discount}
                    {is_percentage ? "%" : "TK"}
                  </span>
                ) : (
                  "N/A"
                )}
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
        <PageTopBar title="Sold" quantity={data?.count || 0}>
          <div>
            <DateFilter />
          </div>
        </PageTopBar>

        <div className="card-wrapper space-y-6">
          <div className="flex gap-6 items-center justify-between flex-wrap">
            <Search />
            <div className="flex gap-6 items-center">
              <ExportTable
                headers={headers}
                tableData={orderedData}
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
