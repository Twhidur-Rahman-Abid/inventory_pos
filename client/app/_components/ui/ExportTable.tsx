/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Dropdown, { DropdownItem } from "./Dropdown";

import Icon from "./Icon";
import Arrow from "./Arrow";
import Button from "./Button";
import { exportTableData } from "@/app/_lib/exportTableData";
import { HeaderType } from "@/app/_lib/CommonTypes";
// import { exportTableData } from "@/lib/exportTableData";

type ExportType = "pdf" | "excel" | "csv";

type ExportProps = {
  headers: HeaderType[];
  tableData?: Record<string, any>[];
  filename?: string;
};

const ExportTable = ({
  headers,
  tableData = [],
  filename = "example_table",
}: ExportProps) => {
  const handleDownload = (type: ExportType) => {
    exportTableData({
      headers,
      data: tableData,
      excludeKeys: ["Status", "Actions"],
      type,
      filename,
    });
  };

  return (
    <Dropdown
      label={
        <Button className="bg-[#E6F2F4] text-secondary px-[22px] py-3.5 w-fit grow md:grow-0">
          <Icon src="/icon/i-export.svg" />
          Export
          <Arrow />
        </Button>
      }
    >
      <DropdownItem
        onClick={() => handleDownload("pdf")}
        className="flex items-center gap-2"
      >
        <Icon src="/icon/i-pdf.svg" /> PDF
      </DropdownItem>

      <DropdownItem
        onClick={() => handleDownload("excel")}
        className="flex items-center gap-2"
      >
        <Icon src="/icon/i-excel.svg" /> Excel
      </DropdownItem>

      <DropdownItem
        onClick={() => handleDownload("csv")}
        className="flex items-center gap-2"
      >
        <Icon src="/icon/i-csv.svg" /> CSV
      </DropdownItem>
    </Dropdown>
  );
};

export default ExportTable;
