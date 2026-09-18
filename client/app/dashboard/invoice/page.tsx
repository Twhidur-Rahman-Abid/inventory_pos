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
import DateFilter from "@/app/_components/DateFilter";

const headers: HeaderType[] = [
  { label: "SL." },

  { label: "Invoice No", key: "id" },
  { label: "Date", key: "created_at" },
  { label: "Branch", key: "branch_name" },
  { label: "items", key: "note" },
];

type Product = {
  id: number;
  sku_code: string;
  price: number;
  quantity: number;
  name: string;
};

type Items = {
  id: number;
  quantity: number;
  product: Product;
};

type InvoiceType = {
  id: number;
  created_at: Date | string;
  branch: {
    id: number;
    name: string;
  };
  invoice_no: string;
  items: Items[];
};

export default function InvoicePage() {
  // 🔹 Search and pagination
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const search = searchParams.get("search");
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");
  let endpoint = `/stocks/inbounds?page=${page}`;
  if (search) endpoint += `&search=${search}`;

  // fetch invoice data
  const { data, isLoading, status, error } = useFetchWAuth<{
    count: number;
    data: InvoiceType[];
  }>({
    endpoint: endpoint,
    isChange: [page, search, startDate, endDate],
  });
  let invoiceedData: InvoiceType[] = [];

  // Decide what to render based on the fetch status
  let content;
  if (isLoading) content = <TableSkeleton />;
  else if (!isLoading && status === "error")
    content = <ErrorMessage message={error || "Failed to load data."} />;
  else if (!isLoading && status === "success" && data?.count === 0)
    content = <NotFoundMessage message="invoice not found." />;
  else invoiceedData = data?.data;
  content = (
    <>
      <Table headers={headers}>
        {data?.data?.map((invoice: InvoiceType, index: number) => {
          const { id, invoice_no, branch, items, created_at } = invoice;
          return (
            <tr key={id} className=" border-b border-c-gray">
              <Td>{getSerial(page, index)}</Td>
              <Td>{invoice_no}</Td>
              <Td>{formatDate(created_at)}</Td>
              <Td>{branch?.name}</Td>
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
        <PageTopBar title="Inbound" quantity={data?.count || 0}>
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
                tableData={invoiceedData}
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
