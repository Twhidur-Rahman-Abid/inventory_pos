import React from "react";
import Table, { Td } from "../ui/Table";
import Image from "next/image";
import Icon from "../ui/Icon";
import { HeaderType } from "@/app/_lib/CommonTypes";

const tableHeaders: HeaderType[] = [
  { label: "Id", key: "serial" },
  { label: "Customer", key: "username" },
  { label: "Type", key: "username" },
  { label: "Date", key: "Actions" },
  { label: "Amount", key: "Actions" },
  { label: "Status", key: "Actions" },
  { label: "Action", key: "Actions" },
];

const RecentOrder = () => {
  return (
    <div className="p-5  bg-white shadow-2 rounded-2xl space-y-5">
      <h3 className="text-c-green text-lg font-bold pb-3 border-b border-colorBorder mb-6">
        Top Selling
      </h3>
      <Table headers={tableHeaders}>
        <tr className="border-b border-gray-300">
          <Td>1</Td>
          <Td>Towhid</Td>
          <Td>
            <button className="px-2.5 py-1 rounded-3xl font-medium text-sm bg-orange-100 text-orange-700">
              Offline
            </button>
          </Td>
          <Td>500</Td>
          <Td>12-APR-2026</Td>
          <Td>
            <button className="px-2.5 py-1 rounded-3xl font-medium text-sm bg-green-100 text-green-700">
              Completed
            </button>
          </Td>

          <Td>
            <Icon src="/icon/i-eye-view.svg" size={24} />
          </Td>
        </tr>
        <tr>
          <Td>1</Td>
          <Td>Towhid</Td>
          <Td>
            <button className="px-2.5 py-1 rounded-3xl font-medium text-sm bg-green-100 text-green-700">
              Online
            </button>
          </Td>
          <Td>500</Td>
          <Td>12-APR-2026</Td>
          <Td>
            <button className="px-2.5 py-1 rounded-3xl font-medium text-sm bg-green-100 text-green-700">
              Completed
            </button>
          </Td>

          <Td>
            <Icon src="/icon/i-eye-view.svg" size={24} />
          </Td>
        </tr>
      </Table>
    </div>
  );
};

export default RecentOrder;
