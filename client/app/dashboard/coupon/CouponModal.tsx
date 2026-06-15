/* eslint-disable prefer-const */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { postJSONData, putJSONData } from "@/app/_actions";
import { Button, Modal, ToggleSwitch } from "@/app/_components";
import { FormInput } from "@/app/_components/ui/Input";
import { FormSelect } from "@/app/_components/ui/Select";
import { COUPON_TYPE_OPTIONS } from "@/app/_constants";
import { CouponSchema } from "@/app/_schema/schema";
import { Coupon } from "@/app/_types/types";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";

import { useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";

const CouponModal = ({
  onClose = () => {},
  fetcher = () => {},
  editable,
}: {
  onClose: () => void;
  fetcher?: () => void;
  editable?: null | Partial<Coupon>;
}) => {
  const [isActive, setIsActive] = useState(editable?.is_active ?? true);

  // Create and edit employee action
  const [state, action] = useActionState(
    async (_: unknown, formData: FormData) =>
      editable?.id
        ? await putJSONData({
            endpoint: `/coupon/${editable?.id}`,
            formData,
          })
        : await postJSONData({
            endpoint: "/coupon/",
            formData,
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
        schema: editable?.id ? CouponSchema.optional() : CouponSchema,
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
      title={editable?.id ? `Edit ${editable.code} Coupon` : "Add New Coupon"}
    >
      <form
        id={form.id}
        onSubmit={form.onSubmit}
        action={action}
        className="space-y-7 pt-6"
      >
        {/* Coupon code and type */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <FormInput
            key={fields.code.key}
            name={fields.code.name}
            defaultValue={fields.code?.initialValue as string | undefined}
            error={fields.code.errors}
            placeholder="NS20"
            label="Code"
          />

          <FormSelect
            label="Coupon Type"
            key={fields.coupon_type.key}
            name={fields.coupon_type.name}
            defaultValue={fields.coupon_type.initialValue as string | undefined}
            error={fields.coupon_type.errors}
            options={COUPON_TYPE_OPTIONS}
            placeholder="Choose a coupon type"
          />
        </div>

        {/* Value and min amount */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <FormInput
            key={fields.value.key}
            name={fields.value.name}
            defaultValue={fields.value?.initialValue as string | undefined}
            error={fields.value.errors}
            placeholder="Enter percentage or amount"
            label="Percentage or Amount"
            type="number"
          />
          <FormInput
            key={fields.min_order_amount.key}
            name={fields.min_order_amount.name}
            defaultValue={
              fields.min_order_amount?.initialValue as string | undefined
            }
            error={fields.min_order_amount.errors}
            placeholder="Enter value"
            label="Min Order Amount"
            required={false}
            type="number"
          />
        </div>

        {/* Max usage and is active */}
        <div className="flex gap-8 items-start">
          <FormInput
            key={fields.max_usage.key}
            name={fields.max_usage.name}
            defaultValue={fields.max_usage?.initialValue as string | undefined}
            error={fields.max_usage.errors}
            placeholder="Enter value"
            label="Max Usage"
            required={false}
            type="number"
          />

          <div className="flex flex-col gap-5 w-full">
            <label
              htmlFor={"description"}
              className="text-secondary font-medium text-base"
            >
              Is Active
            </label>
            <div className="max-w-min">
              <ToggleSwitch
                name={fields.is_active.name}
                checked={isActive}
                onChange={() => setIsActive(!isActive)}
              />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full mt-4">
          {editable?.id ? "Edit Coupon" : "Create Coupon"}
        </Button>
      </form>
    </Modal>
  );
};

export default CouponModal;
