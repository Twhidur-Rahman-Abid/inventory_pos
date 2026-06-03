import React from "react";
import Table, { TableSkeleton, Td } from "../ui/Table";
import Image from "next/image";
import Icon from "../ui/Icon";
import { HeaderType } from "@/app/_lib/CommonTypes";
import useFetchWAuth from "@/app/_hooks/useAuthFetch";
import { ErrorMessage, NotFoundMessage } from "../ui/Alert";
import { cn } from "@/app/_lib/utils";

const tableHeaders: HeaderType[] = [
  { label: "Id", key: "serial" },
  { label: "Customer", key: "username" },
  { label: "Type", key: "username" },
  { label: "Date", key: "Actions" },
  { label: "Amount", key: "Actions" },
  { label: "Status", key: "Actions" },
  { label: "Action", key: "Actions" },
];

type OrderType = {
  id: number;
  customer: string;
  type: "Online" | "Offline";
  amount: number;
  date: string;
  status: string;
};

const RecentOrder = () => {
  const { isLoading, data, status, error } = useFetchWAuth<OrderType[]>({
    endpoint: `/dashboard/recent-orders`,
  });

  let content;
  if (isLoading) content = <TableSkeleton />;
  else if (!isLoading && !data?.length)
    content = <NotFoundMessage message="Recent order not found!" />;
  else if (!isLoading && status === "error")
    content = <ErrorMessage message={error || ""} />;
  else
    content = (
      <Table headers={tableHeaders}>
        {data?.map((order) => (
          <tr className="border-b border-gray-300" key={order.id}>
            <Td>{order.id}</Td>
            <Td>{order.customer}</Td>
            <Td>
              <button
                className={cn(
                  "px-2.5 py-1 rounded-3xl font-medium text-sm bg-orange-100 text-orange-700",
                  order.type === "Online" && "bg-green-100 text-green-700",
                )}
              >
                {order.type}
              </button>
            </Td>
            <Td>{order.date}</Td>
            <Td>{order.amount}</Td>
            <Td>
              <button className="px-2.5 py-1 rounded-3xl font-medium text-sm bg-green-100 text-green-700 capitalize">
                {order.status}
              </button>
            </Td>

            <Td>
              <Icon src="/icon/i-eye-view.svg" size={24} />
            </Td>
          </tr>
        ))}
      </Table>
    );
  return (
    <div className="p-5  bg-white shadow-2 rounded-2xl space-y-5">
      <h3 className="text-c-green text-lg font-bold pb-3 border-b border-colorBorder mb-6">
        Recent Order
      </h3>
      {content}
    </div>
  );
};

export default RecentOrder;
