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
import Table, { TableSkeleton, Td } from "@/app/_components/ui/Table";
import EmployeeModal from "./EmployeeModal";
import useFetchWAuth from "@/app/_hooks/useAuthFetch";
import { ErrorMessage, NotFoundMessage } from "@/app/_components/ui/Alert";
import DeleteItem from "@/app/_components/ui/DeleteItem";
import { EmployeeType } from "@/app/_types/types";
import { toast } from "react-toastify";
import { putJSONData } from "@/app/_actions";
import { useSearchParams } from "next/navigation";

const tableHeaders: HeaderType[] = [
  { label: "Sl.", key: "serial" },
  { label: "Employee Name", key: "username" },
  { label: "Phone", key: "phone" },
  { label: "Email", key: "email" },
  { label: "Employee Position", key: "role" },
  { label: "Branch", key: "branch" },
  { label: "Status", key: "Status", align: "center" },
  { label: "Actions", key: "Actions", align: "center" },
];

const EmployeePage = () => {
  const [modalData, setModalData] = useState<null | {
    open?: boolean;
    editable?: Partial<EmployeeType & { branch_id?: number | string }>;
  }>(null);

  const searchParams = useSearchParams();

  // search and pagination
  const page = Number(searchParams.get("page") || 1);
  const search = searchParams.get("search");
  let endpoint = `/users?page=${page}`;
  if (search) endpoint += `&search=${search}`;

  // Fetch user
  const { data, isLoading, status, error, fetcher } = useFetchWAuth<{
    count: number;
    data: EmployeeType[];
    has_next: boolean;
  }>({
    endpoint: endpoint,
    isChange: [page, search],
  });

  // switch active
  const switchActive = async (is_active: boolean, name: string, id: number) => {
    const toastId = toast.loading(`User ${name}'s status updating...`);
    const formData = new FormData();
    formData.append("is_active", String(is_active));

    const res = await putJSONData({
      endpoint: `/users/${id}/`,
      formData,
    });

    if (res?.status === "success") {
      fetcher();
      toast.done(toastId);
      toast.success("Status updated!");
    } else {
      toast.done(toastId);
      toast.error(res?.message);
    }
  };

  // decide what to render
  let content;
  if (isLoading) content = <TableSkeleton />;
  else if (!isLoading && status === "error")
    content = <ErrorMessage message={error || "Failed to load data."} />;
  else if (!isLoading && status === "success" && data?.count === 0)
    content = <NotFoundMessage message="Employee not found." />;
  else
    content = (
      <>
        <Table headers={tableHeaders}>
          {data?.data?.map((employee: EmployeeType, index: number) => {
            const { id, email, mobile, role, name, is_active, branch } =
              employee;
            return (
              <tr key={id}>
                <Td>{index + 1}</Td>
                <Td>{name}</Td>
                <Td>{email}</Td>
                <Td>{mobile}</Td>
                <Td className="capitalize">
                  {role.toString().split("_").join(" ")}
                </Td>
                <Td>{branch?.name}</Td>
                <Td>
                  <ToggleSwitch
                    checked={is_active}
                    onChange={() => switchActive(!is_active, name, id)}
                  />
                </Td>

                <Td>
                  <div className="inline-flex gap-5 min-w-max items-center justify-center w-full">
                    <Icon
                      onClick={() =>
                        setModalData({
                          open: true,
                          editable: {
                            ...employee,
                            branch_id: String(employee.branch.id),
                          },
                        })
                      }
                      src="/icon/i-edit-pen.svg"
                      size={24}
                    />

                    <DeleteItem
                      endpoint={`/users/${id}`}
                      fetcher={fetcher}
                      title={`${name} Employee`}
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
      <PageTopBar title="Employee" quantity={data?.count}>
        <Button
          className=" border-none px-3.5"
          onClick={() => setModalData({ open: true })}
        >
          ADD Employee
          <Icon src="/icon/i-plus.svg" className="hidden md:inline-block" />
        </Button>
      </PageTopBar>

      <div className="card-wrapper space-y-6">
        <div className="flex gap-6 items-center justify-between flex-wrap">
          <Search />
          <div className="flex gap-6 items-center">
            <ExportTable
              headers={tableHeaders}
              tableData={data?.data}
              filename={`employee_${page}`}
            />
          </div>
        </div>

        {content}

        <Pagination count={data?.count} />
      </div>
      {modalData && (
        <EmployeeModal
          onClose={() => setModalData(null)}
          editable={modalData?.editable}
          fetcher={fetcher}
        />
      )}
    </>
  );
};

export default EmployeePage;
