"use client";
import { useState } from "react";

import { HeaderType } from "@/app/_lib/CommonTypes";
import { Button, Icon, PageTopBar, Search } from "@/app/_components";
import Table, { Td } from "@/app/_components/ui/Table";
import BranchModal from "./BranchModal";
import useFetchWAuth from "@/app/_hooks/useAuthFetch";
import Loading from "@/app/_components/ui/Loading";
import { ErrorMessage, NotFoundMessage } from "@/app/_components/ui/Alert";
import Image from "next/image";
import DeleteItem from "@/app/_components/ui/DeleteItem";
import { useSearchParams } from "next/navigation";
type BranchType = {
  id: number;
  name: string;
  img?: string;
  location?: string;
};
const tableHeaders: HeaderType[] = [
  { label: "Sl.", key: "serial" },
  { label: "Name", key: "name" },
  { label: "Image", key: "img" },
  { label: "Location", key: "location" },
  { label: "Actions", key: "Actions", align: "center" },
];

const BranchPage = () => {
  // modal state
  const [isModalOpen, setIsModalOpen] = useState<null | {
    open?: boolean;
    editable?: Partial<BranchType>;
  }>(null);

  // fetch branch
  const { data, isLoading, status, error, fetcher } = useFetchWAuth({
    endpoint: "/branches",
  });

  // search branch
  const searchParams = useSearchParams();
  const search = searchParams.get("search");

  const searchFilter = (v: BranchType) =>
    search
      ? v.name.toLowerCase().includes(search.toLowerCase()) ||
        (v.location ?? "").toLowerCase().includes(search.toLowerCase())
      : true;

  // decide what to render based on fetched data
  let content;
  if (isLoading) content = <Loading />;
  else if (!isLoading && status === "error")
    content = <ErrorMessage message={error || "Failed to load data."} />;
  else if (!isLoading && status === "success" && data?.length === 0)
    content = <NotFoundMessage message="Branch not found." />;
  else
    content = (
      <>
        <Table headers={tableHeaders}>
          {data
            ?.filter(searchFilter)
            ?.map((branch: BranchType, index: number) => {
              const { id, name, location, img } = branch;
              return (
                <tr key={id}>
                  <Td>{index + 1}</Td>
                  <Td>{name}</Td>
                  <Td>
                    {img ? (
                      <Image
                        src={img}
                        width={32}
                        height={32}
                        alt={name}
                        className="object-contain"
                      />
                    ) : (
                      "N/A"
                    )}
                  </Td>
                  <Td>{location || "N/A"}</Td>
                  <Td>
                    <div className="inline-flex gap-5 min-w-max items-center justify-center w-full">
                      <Icon
                        onClick={() =>
                          setIsModalOpen({
                            open: true,
                            editable: branch,
                          })
                        }
                        src="/icon/i-edit-pen.svg"
                        size={24}
                      />

                      <DeleteItem
                        endpoint={`/branches/${id}`}
                        fetcher={fetcher}
                        title={`${name} Branch`}
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
      <PageTopBar title="Branch" quantity={data?.length}>
        <Button
          className=" border-none px-3.5"
          onClick={() => setIsModalOpen({ open: true })}
        >
          ADD Branch
          <Icon src="/icon/i-plus.svg" className="hidden md:inline-block" />
        </Button>
      </PageTopBar>

      <div className="card-wrapper space-y-6">
        <div className="flex gap-6 items-center justify-between flex-wrap">
          <Search />
        </div>
        {content}
      </div>
      {isModalOpen && (
        <BranchModal
          onClose={() => setIsModalOpen(null)}
          fetcher={fetcher}
          editable={isModalOpen?.editable}
        />
      )}
    </>
  );
};

export default BranchPage;
