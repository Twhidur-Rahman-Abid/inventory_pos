"use client";
import React, { useState } from "react";

import { HeaderType } from "@/app/_lib/CommonTypes";
import {
  Button,
  ExportTable,
  Icon,
  PageTopBar,
  Pagination,
  Search,
  ToggleSwitch,
} from "@/app/_components";
import Table, { Td } from "@/app/_components/ui/Table";
import EmployeeModal from "./EmployeeModal";

const tableHeaders: HeaderType[] = [
  { label: "Sl.", key: "serial" },
  { label: "Employee ID", key: "username" },
  { label: "Employee Name", key: "username" },
  { label: "Employee Position", key: "role" },
  { label: "Status", key: "Status", align: "center" },
  { label: "Actions", key: "Actions", align: "center" },
];

const EmployeePage = () => {
  const [isEmployeeOpen, setIsEmployeeOpen] = useState(false);
  return (
    <>
      <PageTopBar title="Employee" quantity={2}>
        <Button
          className=" border-none px-3.5"
          onClick={() => setIsEmployeeOpen(true)}
        >
          ADD Employee
          <Icon src="/icon/i-plus.svg" className="hidden md:inline-block" />
        </Button>
      </PageTopBar>

      <div className="card-wrapper space-y-6">
        <div className="flex gap-6 items-center justify-between flex-wrap">
          <Search />
          <div className="flex gap-6 items-center">
            <ExportTable headers={tableHeaders} tableData={[]} />
          </div>
        </div>

        <Table headers={tableHeaders}>
          <tr>
            <Td>1</Td>
            <Td>EMP001</Td>
            <Td>John Doe</Td>
            <Td>Manager</Td>
            <Td>
              <ToggleSwitch />
            </Td>
            <Td>
              <div className="inline-flex gap-5 min-w-max">
                <Icon src="/icon/i-edit-pen.svg" size={24} />
                <Icon src="/icon/i-eye-view.svg" size={24} />
                <Icon src="/icon/i-delete.svg" size={24} />
              </div>
            </Td>
          </tr>
        </Table>

        <Pagination totalPage={0} />
      </div>
      {isEmployeeOpen && (
        <EmployeeModal onClose={() => setIsEmployeeOpen(false)} />
      )}
    </>
  );
};

export default EmployeePage;
