"use client";
import React, { Suspense, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "./Icon";
import Input from "./Input";
import { debounce } from "../../_lib/utils";

const SearchComp = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentSearch = searchParams.get("search") || "";

  const handleSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }

      params.set("page", "1");

      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router],
  );

  const debouncedSearch = useMemo(
    () => debounce((value: string) => handleSearch(value), 1000),
    [handleSearch],
  );

  return (
    <Input
      placeholder="Search Here..."
      className="border-[1.5px] w-full md:max-w-75 grow"
      LeftIcon={<Icon src="/icon/i-search.svg" className="mr-2.5 md:mr-3.75" />}
      defaultValue={currentSearch}
      getInputValue={(value) => debouncedSearch(value)}
    />
  );
};

const Search = () => (
  <Suspense>
    <SearchComp />
  </Suspense>
);

export default Search;
