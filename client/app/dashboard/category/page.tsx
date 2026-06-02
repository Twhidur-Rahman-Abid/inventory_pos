"use client";
import { useState } from "react";

import { HeaderType } from "@/app/_lib/CommonTypes";
import {
  Button,
  Icon,
  PageTopBar,
  Search,
  DeleteItem,
  ExportTable,
} from "@/app/_components";
import Table, { TableSkeleton, Td } from "@/app/_components/ui/Table";
import useFetchWAuth from "@/app/_hooks/useAuthFetch";
import { ErrorMessage, NotFoundMessage } from "@/app/_components/ui/Alert";
import Image from "next/image";
import { CategoryType } from "@/app/_types/types";
import CategoryModal from "./CategoryModal";
import { useSearchParams } from "next/navigation";

const tableHeaders: HeaderType[] = [
  { label: "ID.", key: "Id" },
  { label: "Name", key: "name" },
  { label: "Image" },
  { label: "Actions", key: "Actions", align: "center" },
];

const CategoryPage = () => {
  // Category Modal state
  const [categoryOpen, setCategoryOpen] = useState<
    null | (Partial<CategoryType> & { open?: boolean })
  >(null);

  // Fetch category
  const { data, isLoading, status, error, fetcher } = useFetchWAuth<{
    count: number;
    data: CategoryType[];
  }>({
    endpoint: "/categories",
  });

  const searchParams = useSearchParams();
  const search = searchParams.get("search");

  const searchFilter = (v: CategoryType) =>
    search ? v.name.toLowerCase().includes(search.toLowerCase()) : true;

  // decide what to render based fetch response
  let content;
  if (isLoading) content = <TableSkeleton />;
  else if (!isLoading && status === "error")
    content = <ErrorMessage message={error || "Failed to load data."} />;
  else if (!isLoading && status === "success" && data?.count === 0)
    content = <NotFoundMessage message="Category not found." />;
  else
    content = (
      <>
        <Table headers={tableHeaders}>
          {data?.data
            ?.filter(searchFilter)
            ?.map((branch: CategoryType, index: number) => {
              const { id, name, img } = branch;
              return (
                <tr key={id}>
                  <Td>{index + 1}</Td>
                  <Td>{name}</Td>
                  <Td>
                    {img ? (
                      <Image src={img} width={24} height={24} alt={name} />
                    ) : (
                      "N/A"
                    )}
                  </Td>

                  <Td>
                    <div className="inline-flex gap-5 min-w-max items-center justify-center w-full">
                      <Icon
                        onClick={() => setCategoryOpen(branch)}
                        src="/icon/i-edit-pen.svg"
                        size={24}
                      />

                      <DeleteItem
                        endpoint={`/categories/${id}`}
                        fetcher={fetcher}
                        title={`${name} Category`}
                      />
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
      <PageTopBar title="Category" quantity={data?.count}>
        <Button
          className=" border-none px-3.5"
          onClick={() => setCategoryOpen({ open: true })}
        >
          ADD Category
          <Icon src="/icon/i-plus.svg" className="hidden md:inline-block" />
        </Button>
      </PageTopBar>

      <div className="card-wrapper space-y-6">
        <div className="flex gap-6 items-center justify-between flex-wrap w-full">
          <Search />
          <div className="flex gap-6 items-center">
            <ExportTable
              headers={tableHeaders}
              tableData={data?.data}
              filename={`Category`}
            />
          </div>
        </div>
        {content}
      </div>
      {categoryOpen && (
        <CategoryModal
          onClose={() => setCategoryOpen(null)}
          fetcher={fetcher}
          editable={categoryOpen}
        />
      )}
    </>
  );
};

export default CategoryPage;
