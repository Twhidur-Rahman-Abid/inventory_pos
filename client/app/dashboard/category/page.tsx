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
import Image from "next/image";
import CategoryModal from "./CategoryModal";

const tableHeaders: HeaderType[] = [
  { label: "Sl.", key: "serial" },
  { label: "Name", key: "username" },
  { label: "Image", key: "username" },
  { label: "Actions", key: "Actions", align: "center" },
];

const CategoryPage = () => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  return (
    <>
      <PageTopBar title="Category" quantity={2}>
        <Button
          className=" border-none px-3.5"
          onClick={() => setIsCategoryOpen(true)}
        >
          ADD Category
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
            <Td>Category 1</Td>
            <Td>
              <Image
                width={60}
                height={60}
                src="/placeholder-img.svg"
                alt="Category Image"
                className="w-16 h-16 object-cover rounded"
              />
            </Td>

            <Td>
              <div className="w-full inline-flex justify-center items-center gap-5 min-w-max">
                <Icon src="/icon/i-edit-pen.svg" size={24} />
                <Icon src="/icon/i-eye-view.svg" size={24} />
                <Icon src="/icon/i-delete.svg" size={24} />
              </div>
            </Td>
          </tr>
        </Table>

        <Pagination totalPage={0} />
      </div>
      {isCategoryOpen && (
        <CategoryModal onClose={() => setIsCategoryOpen(false)} />
      )}
    </>
  );
};

export default CategoryPage;
