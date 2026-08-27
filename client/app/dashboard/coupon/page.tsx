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
import useFetchWAuth from "@/app/_hooks/useAuthFetch";
import { ErrorMessage, NotFoundMessage } from "@/app/_components/ui/Alert";
import DeleteItem from "@/app/_components/ui/DeleteItem";
import { Coupon } from "@/app/_types/types";
import { toast } from "react-toastify";
import { putJSONData } from "@/app/_actions";
import { useSearchParams } from "next/navigation";
import { MONEY_SYMBOL } from "@/app/_constants";
import CouponModal from "./CouponModal";

const tableHeaders: HeaderType[] = [
  { label: "Sl.", key: "id" },
  { label: "Code", key: "code" },
  { label: "Type", key: "coupon_type" },
  { label: "Value", key: "value" },
  { label: "Min Order Amount", key: "min_order_amount" },
  { label: "Max Usage", key: "max_usage" },
  { label: "Used", key: "used_count" },
  { label: "Status", key: "Status", align: "center" },
  { label: "Actions", key: "Actions", align: "center" },
];

const CouponPage = () => {
  const [modalData, setModalData] = useState<null | {
    open?: boolean;
    editable?: Partial<Coupon>;
  }>(null);

  const searchParams = useSearchParams();

  // search and pagination

  const search = searchParams.get("search");
  const endpoint = `/coupon`;

  // Fetch user
  const {
    data: { data },
    isLoading,
    status,
    error,
    fetcher,
  } = useFetchWAuth<{
    data: Coupon[];
  }>({
    endpoint: endpoint,
  });

  // switch active
  const switchActive = async (is_active: boolean, name: string, id: number) => {
    const toastId = toast.loading(`${name}'s status updating...`);
    const formData = new FormData();
    formData.append("is_active", String(is_active));

    const res = await putJSONData({
      endpoint: `/coupon/${id}/`,
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
  else if (!isLoading && status === "success" && data?.length === 0)
    content = <NotFoundMessage message="Employee not found." />;
  else
    content = (
      <>
        <Table headers={tableHeaders}>
          {data
            ?.filter(
              (coupon) =>
                !search ||
                coupon.code.toLowerCase().includes(search.toLowerCase()),
            )
            ?.map((coupon: Coupon, index: number) => {
              const {
                id,
                code,
                coupon_type,
                value,
                min_order_amount,
                max_usage,
                used_count,
                is_active,
              } = coupon;
              return (
                <tr key={id}>
                  <Td>{index + 1}</Td>
                  <Td>{code}</Td>
                  <Td className="capitalize">{coupon_type}</Td>
                  <Td>
                    {coupon_type === "percentage"
                      ? `${value}%`
                      : `${MONEY_SYMBOL}${value}`}
                  </Td>
                  <Td className="capitalize">{min_order_amount}</Td>
                  <Td>{max_usage}</Td>
                  <Td>{used_count}</Td>
                  <Td>
                    <ToggleSwitch
                      checked={is_active}
                      onChange={() => switchActive(!is_active, code, id)}
                    />
                  </Td>

                  <Td>
                    <div className="inline-flex gap-5 min-w-max items-center justify-center w-full">
                      <Icon
                        onClick={() =>
                          setModalData({
                            open: true,
                            editable: coupon,
                          })
                        }
                        src="/icon/i-edit-pen.svg"
                        size={24}
                      />

                      <DeleteItem
                        endpoint={`/coupon/${id}`}
                        fetcher={fetcher}
                        title={`${code} coupon`}
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
      <PageTopBar title="Coupon" quantity={data?.length}>
        <Button
          className=" border-none px-3.5"
          onClick={() => setModalData({ open: true })}
        >
          ADD Coupon
          <Icon src="/icon/i-plus.svg" className="hidden md:inline-block" />
        </Button>
      </PageTopBar>

      <div className="card-wrapper space-y-6">
        <div className="flex gap-6 items-center justify-between flex-wrap">
          <Search />
          <div className="flex gap-6 items-center">
            <ExportTable
              headers={tableHeaders}
              tableData={data}
              filename={`coupon`}
            />
          </div>
        </div>

        {content}

        <Pagination count={data?.length} />
      </div>
      {modalData && (
        <CouponModal
          onClose={() => setModalData(null)}
          editable={modalData?.editable}
          fetcher={fetcher}
        />
      )}
    </>
  );
};

export default CouponPage;
