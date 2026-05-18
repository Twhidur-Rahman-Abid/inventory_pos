/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { postData, putData } from "@/app/_actions";
import { Button, Modal } from "@/app/_components";
import { FormInput } from "@/app/_components/ui/Input";
import { branchSchema } from "@/app/_schema/schema";
import { BranchType } from "@/app/_types/types";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";

const BranchModal = ({
  onClose = () => {},
  fetcher = () => {},
  editable,
}: {
  onClose: () => void;
  fetcher?: () => void;
  editable?: null | Partial<BranchType>;
}) => {
  // keep image
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState(
    editable?.img || "/placeholder-img.svg",
  );

  // post or put branch based on editable
  const [state, action] = useActionState(
    async (_: unknown, formData: FormData) => {
      if (selectedImage) formData.set("image", selectedImage);
      return editable?.id
        ? await putData({
            endpoint: `/branches/${editable?.id}`,
            formData,
            schemaName: "branch",
          })
        : await postData({
            endpoint: "/branches/",
            formData,
            schemaName: "branch",
          });
    },
    editable?.id ? editable : undefined,
  );

  const { status, lastResult, message } = state || {};

  // conform
  const [form, fields] = useForm({
    id: state,
    lastResult,
    defaultValue: lastResult?.initialValue || editable || undefined,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: branchSchema });
    },

    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  console.log("fields", fields, "lastResult", lastResult);

  useEffect(() => {
    if (status === "error") {
      toast.error(message);
    } else if (status === "success") {
      fetcher();
      toast.success(editable?.id ? "Branch edited!" : "Branch created!");
      onClose();
    }
  }, [state]);

  return (
    <Modal
      onClose={onClose}
      title={editable?.id ? `Edit ${editable.name} Branch` : "Add New Branch"}
    >
      <form
        id={form.id}
        onSubmit={form.onSubmit}
        action={action}
        encType="multipart/form-data"
        className="space-y-7 pt-6"
      >
        {/* Name */}
        <FormInput
          key={fields.name.key}
          name={fields.name.name}
          defaultValue={fields.name?.initialValue as string | undefined}
          error={fields.name.errors}
          placeholder="Enter name"
          label="Name"
        />

        {/* Location */}
        <FormInput
          name={fields.location.name}
          defaultValue={fields.location.initialValue as string | undefined}
          error={fields.location.errors}
          label="Location"
          required={false}
          placeholder="Enter branch location"
        />

        {/* Image Preview and File Upload */}
        <div className="flex justify-between items-center">
          <div className="py-2.5 text-center w-full">
            <Image
              className="mx-auto size-36 object-contain"
              src={preview}
              width={144}
              height={144}
              alt="inventory"
            />
          </div>

          <FormInput
            type="file"
            name={fields.image.name}
            accept="image/*"
            error={fields.image.errors}
            required={false}
            label="Image"
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (file) {
                setPreview(URL.createObjectURL(file));
                setSelectedImage(file);
              }
            }}
          />
        </div>

        <div className="flex justify-end gap-5">
          <Button type="submit" className="max-w-min">
            {editable?.id ? "Edit Branch" : "Create Branch"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BranchModal;
