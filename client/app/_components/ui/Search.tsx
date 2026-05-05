"use client";
import React, { Suspense, useCallback } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import Icon from "./Icon";
import Input from "./Input";
import { debounce } from "../../_lib/utils";

const SearchComp = () => {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const router = useRouter();
  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    params.set("page", "1");

    router.replace(`?${params.toString()}`);
  };
  // eslint-disable-next-line react-hooks/use-memo
  const debouncedSearch = useCallback(debounce(handleSearch, 1000), []);
  return (
    <Input
      placeholder="Search Here..."
      className="border-[1.5px] w-full md:max-w-75 grow"
      LeftIcon={<Icon src="/icon/i-search.svg" className="mr-2.5 md:mr-3.75" />}
      defaultValue={search}
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
