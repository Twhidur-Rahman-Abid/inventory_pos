"use client";
import { postJSONData } from "@/app/_actions";
import { Button, FormInput } from "@/app/_components";
import { ChangePassSchema } from "@/app/_schema/schema";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import React, { useActionState, useEffect } from "react";
import { toast } from "react-toastify";

const ChangePassword = () => {
  const [state, action] = useActionState(
    async (_: unknown, formData: FormData) =>
      await postJSONData({
        endpoint: "/auth/reset-password",
        formData,
        schemaName: "ChangePassSchema",
      }),
    undefined,
  );

  const { lastResult } = state || {};

  // Conform state
  const [form, fields] = useForm({
    id: state,
    lastResult,
    defaultValue: lastResult?.initialValue || undefined,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: ChangePassSchema,
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
      toast.success("Password Changed");
    }
  }, [state]);
  return (
    <div className="card-wrapper">
      <h3 className="text-2xl font-bold pb-6">Change Password</h3>
      <form
        id={form.id}
        onSubmit={form.onSubmit}
        action={action}
        className="space-y-7 pt-6"
      >
        <FormInput
          key={fields.email.key}
          name={fields.email.name}
          defaultValue={fields.email?.initialValue as string | undefined}
          error={fields.email.errors}
          placeholder="Enter email"
          label="Email"
        />
        <div className="flex flex-col gap-6 md:flex-row">
          <FormInput
            key={fields.old_password.key}
            name={fields.old_password.name}
            defaultValue={
              fields.old_password?.initialValue as string | undefined
            }
            error={fields.old_password.errors}
            placeholder="******"
            type="password"
            label="Old Password"
          />
          <FormInput
            key={fields.new_password.key}
            name={fields.new_password.name}
            defaultValue={
              fields.new_password?.initialValue as string | undefined
            }
            error={fields.new_password.errors}
            placeholder="******"
            type="password"
            label="New Password"
          />
        </div>

        <div className="flex justify-end gap-5">
          <Button type="submit" className="max-w-min">
            Change Password
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
