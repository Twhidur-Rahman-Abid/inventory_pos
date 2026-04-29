/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Button, InputGroup, Modal, Select } from "@/app/_components";
import React, { useEffect, useState } from "react";

interface OptionType {
  value: string | number;
  label: string;
}

interface EmployeeModalProps {
  onClose: () => void;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({ onClose }) => {
  const [branchOption, setBranchOption] = useState<OptionType[]>([
    { value: "hidden", label: "Select Branch..." },
  ]);

  const roleOptions: OptionType[] = [
    { value: "storeManager", label: "Store Manager" },
    { value: "warehouseStaff", label: "Warehouse Staff" },
    { value: "cashier", label: "Cashier" },
  ];

  // Dummy branch data (since backend removed)
  useEffect(() => {
    const dummyBranches = [
      { label: "Main Branch", value: 1 },
      { label: "Warehouse", value: 2 },
    ];

    setBranchOption((prev) => [...prev, ...dummyBranches]);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    console.log("FORM DATA:", data);
  };

  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    form?.reset();
  };

  return (
    <Modal onClose={onClose} title="Add New Employee">
      <form onSubmit={handleSubmit} className="space-y-[30px] pt-6">
        <div className="flex gap-6">
          <InputGroup
            name="first_name"
            label="First name"
            placeholder="Enter first name"
          />
          <InputGroup
            name="last_name"
            label="Last Name"
            required={false}
            placeholder="Enter last name"
          />
        </div>

        <InputGroup
          name="username"
          label="Username"
          placeholder="Enter username"
        />

        <InputGroup
          name="email"
          label="Email"
          type="email"
          placeholder="Enter user email"
        />

        <InputGroup
          name="password"
          label="Password"
          type="password"
          placeholder="Enter user password"
        />

        <div className="flex items-start gap-6">
          <Select
            name="role"
            label="Role"
            className="py-3.5"
            options={roleOptions}
          />

          <Select
            name="branch"
            label="Branch"
            className="py-3.5"
            options={branchOption}
          />
        </div>

        <div className="flex justify-end gap-5">
          <Button
            onClick={handleReset}
            className="text-body-text bg-c-gray max-w-min"
          >
            Reset
          </Button>

          <Button type="submit" className="max-w-min">
            Create Employee
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeModal;
