"use client";

import React, { useState, FormEvent } from "react";
import Dropdown from "./Dropdown";

import Icon from "./Icon";
import Arrow from "./Arrow";
import InputGroup from "./InputGroup";
import Button from "./Button";

type ImportTableProps = {
  base_url?: string;
  handleUploadFile?: (formData: FormData) => Promise<void>;
};

const ImportTable = ({ base_url, handleUploadFile }: ImportTableProps) => {
  const [file, setFile] = useState<File | null>(null);

  return (
    <Dropdown
      className="md:w-112.5 xl:w-125 grow max-h-max"
      label={
        <Button className="bg-[#E6F2F4] text-secondary px-5.5 py-3.5 w-full grow md:grow-0">
          <Icon src="/icon/i-import.svg" />
          Import
          <Arrow />
        </Button>
      }
    >
      {({ onCloseDropdown }) => (
        <div>
          <form
            onSubmit={async (e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();

              const form = e.currentTarget;
              const formData = new FormData(form);

              //   await handleUploadFile(formData);

              form.reset();
              setFile(null);
              onCloseDropdown();
            }}
            className="p-6 lg:p-10 space-y-4 lg:space-y-6"
          >
            <p className="text-secondary text-xl font-semibold text-center pb-4 border-b border-c-gray">
              Import File
            </p>

            <p>Not sure what format to use? Download our example file first:</p>

            <a href={`${base_url}/products/sample/`} className="mb-6" download>
              <Button className="border border-primary mb-6 py-2 bg-white text-secondary">
                Download
              </Button>
            </a>

            <InputGroup
              type="file"
              name="file"
              accept=".xlsx,.xls,.csv"
              label="Product excel"
              icon={<Icon src="/icon/i-file.svg" />}
              placeholder={file?.name || "Choose file"}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              setInputValue={(e: any) => setFile(e?.target?.files?.[0] || null)}
            />

            <div className="flex justify-end gap-5">
              <Button
                type="button"
                onClick={onCloseDropdown}
                className="text-body-text bg-c-gray max-w-min"
              >
                Cancel
              </Button>

              <Button type="submit" className="max-w-min">
                Submit
              </Button>
            </div>
          </form>
        </div>
      )}
    </Dropdown>
  );
};

export default ImportTable;
