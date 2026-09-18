"use client";
import Form from "next/form";
import React from "react";

import { useSearchParams, useRouter } from "next/navigation";
import Dropdown from "./ui/Dropdown";
import Button from "./ui/Button";
import Icon from "./ui/Icon";
import InputGroup from "./ui/InputGroup";

const DateFilter = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read YYYY-MM-DD directly from URL
  const startValue = searchParams.get("start") || "";
  const endValue = searchParams.get("end") || "";

  const handleSubmit = (
    formData: FormData,
    onCloseDropdown: () => void,
  ): void => {
    // Preserve existing query params
    const params = new URLSearchParams(searchParams.toString());

    const start = formData.get("start") as string | null;
    const end = formData.get("end") as string | null;

    // Set or delete start date (YYYY-MM-DD)
    if (start) {
      params.set("start", start);
    } else {
      params.delete("start");
    }

    // Set or delete end date (YYYY-MM-DD)
    if (end) {
      params.set("end", end);
    } else {
      params.delete("end");
    }

    // Reset page to 1 if page query param exists
    if (params.has("page")) {
      params.set("page", "1");
    }

    router.replace(`?${params.toString()}`);
    onCloseDropdown();
  };

  const handleReset = (onCloseDropdown: () => void) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("start");
    params.delete("end");

    if (params.has("page")) {
      params.set("page", "1");
    }

    router.replace(`?${params.toString()}`);
    onCloseDropdown();
  };

  return (
    <Dropdown
      className="max-h-fit p-0 border-0"
      label={
        <Button>
          ADVANCED FILTERS <Icon src="/icon/i-filter.svg" size={16} />
        </Button>
      }
    >
      {({ onCloseDropdown }) => (
        <Form
          action={(formData) => handleSubmit(formData, onCloseDropdown)}
          className="p-6 md:p-10 shadow-2 rounded-xl bg-white min-w-full sm:w-120 md:w-150 z-30"
        >
          <p className="text-xl font-semibold text-secondary text-center pb-6 border-b border-c-gray mb-4">
            Advanced Filters
          </p>

          <InputGroup
            className="w-full mb-6"
            label="From"
            type="date"
            name="start"
            defaultValue={startValue}
          />

          <InputGroup
            className="w-full"
            label="To"
            type="date"
            required={false}
            name="end"
            defaultValue={endValue}
          />

          <p className="text-lg text-gray-600 my-2">
            <span className="text-red-500 font-medium">Note:</span> If you use
            only start date, it will filter all data from that date.
          </p>

          <div className="flex justify-end gap-5 mt-10">
            <Button
              type="button"
              className="text-body-text bg-c-gray max-w-min"
              onClick={() => handleReset(onCloseDropdown)}
            >
              Reset
            </Button>

            <Button type="submit" className="max-w-min">
              Search
            </Button>
          </div>
        </Form>
      )}
    </Dropdown>
  );
};

export default DateFilter;
