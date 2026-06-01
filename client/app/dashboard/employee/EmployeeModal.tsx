/* eslint-disable prefer-const */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { postJSONData, putJSONData } from "@/app/_actions";
import { Button, Modal } from "@/app/_components";
import { FormInput } from "@/app/_components/ui/Input";
import { FormSelect } from "@/app/_components/ui/Select";
import { InputSkeleton } from "@/app/_components/ui/Skeleton";
import { USER_ROLE } from "@/app/_constants";
import useFetchWAuth from "@/app/_hooks/useAuthFetch";
import { EmployeeSchema } from "@/app/_schema/schema";
import { EmployeeType } from "@/app/_types/types";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";

import { useActionState, useEffect } from "react";
import { toast } from "react-toastify";

const EmployeeModal = ({
  onClose = () => {},
  fetcher = () => {},
  editable,
}: {
  onClose: () => void;
  fetcher?: () => void;
  editable?: null | Partial<EmployeeType & { branch_id: number | string }>;
}) => {
  // fetch branch
  // TODO: implement cache
  const { data: branch, isLoading: isBranchLoading } = useFetchWAuth({
    endpoint: "/branches",
  });

  // Create and edit employee action
  const [state, action] = useActionState(
    async (_: unknown, formData: FormData) =>
      editable?.id
        ? await putJSONData({
            endpoint: `/users/${editable?.id}`,
            formData,
            schemaName: "employee",
          })
        : await postJSONData({
            endpoint: "/users/",
            formData,
            schemaName: "employee",
          }),
    editable?.id ? editable : undefined,
  );

  const { lastResult } = state || {};

  // Conform state
  const [form, fields] = useForm({
    id: state,
    lastResult,
    defaultValue: lastResult?.initialValue || editable || undefined,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: editable?.id
          ? EmployeeSchema.omit("password").optional()
          : EmployeeSchema,
      });
    },

    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  // Show Toast message
  useEffect(() => {
    if (state?.status === "error") {
      toast.error(state?.message);
    } else if (state?.status === "success") {
      fetcher();
      toast.success(editable?.id ? "Employee edited!" : "Employee created!");
      onClose();
    }
  }, [state]);

  return (
    <Modal
      onClose={onClose}
      title={
        editable?.id ? `Edit ${editable.name} Employee` : "Add New Employee"
      }
    >
      <form
        id={form.id}
        onSubmit={form.onSubmit}
        action={action}
        className="space-y-7 pt-6"
      >
        <FormInput
          key={fields.name.key}
          name={fields.name.name}
          defaultValue={fields.name?.initialValue as string | undefined}
          error={fields.name.errors}
          placeholder="Enter name"
          label="Name"
        />
        <FormInput
          key={fields.email.key}
          name={fields.email.name}
          defaultValue={fields.email?.initialValue as string | undefined}
          error={fields.email.errors}
          placeholder="Enter email"
          label="Email"
        />
        <FormInput
          key={fields.mobile.key}
          name={fields.mobile.name}
          defaultValue={fields.mobile?.initialValue as string | undefined}
          error={fields.mobile.errors}
          placeholder="Enter phone"
          label="Phone"
        />
        {!editable && (
          <FormInput
            key={fields.password.key}
            name={fields.password.name}
            defaultValue={fields.password?.initialValue as string | undefined}
            error={fields.password.errors}
            placeholder="******"
            type="password"
            label="Password"
          />
        )}

        <div className="w-full flex flex-col gap-6 lg:flex-row">
          <FormSelect
            label="Role"
            key={fields.role.key}
            name={fields.role.name}
            defaultValue={fields.role.initialValue as string | undefined}
            error={fields.role.errors}
            options={USER_ROLE}
            placeholder="Choose a role"
          />
          {isBranchLoading ? (
            <InputSkeleton label="Branch" />
          ) : (
            <FormSelect
              label="Branch"
              name={fields.branch_id.name}
              defaultValue={
                fields.branch_id.initialValue as string | number | undefined
              }
              error={fields.branch_id.errors}
              options={branch?.map((b) => ({ value: b.id, label: b.name }))}
              placeholder="Choose a branch"
            />
          )}
        </div>

        <div className="flex justify-end gap-5">
          <Button type="submit" className="max-w-min">
            {editable?.id ? "Edit Employee" : "Create Employee"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeModal;
