/* eslint-disable prefer-const */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { postData, putData } from "@/app/_actions";
import { Button, Modal } from "@/app/_components";
import { FormInput } from "@/app/_components/ui/Input";
import { categorySchema } from "@/app/_schema/schema";
import { CategoryType } from "@/app/_types/types";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";

const BrandModal = ({
  onClose = () => {},
  fetcher = () => {},
  editable,
}: {
  onClose: () => void;
  fetcher?: () => void;
  editable?: null | (Partial<CategoryType> & { open?: boolean });
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState(
    editable?.img || "/placeholder-img.svg",
  );

  // Brand data post and put action based on editable data
  const [state, action] = useActionState(
    async (_: unknown, formData: FormData) => {
      if (selectedImage) formData.set("image", selectedImage);
      return editable?.id
        ? await putData({
            endpoint: `/brands/${editable?.id}`,
            formData,
          })
        : await postData({
            endpoint: "/brands/",
            formData,
          });
    },
    editable?.id ? editable : undefined,
  );

  // Brand form
  const [form, fields] = useForm({
    id: state,
    lastResult: state?.lastResult,
    defaultValue: state?.lastResult?.initialValue || editable || undefined,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: categorySchema });
    },

    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  useEffect(() => {
    if (state?.status === "error") {
      toast.error(state?.message);
    } else if (state?.status === "success") {
      fetcher();
      toast.success(editable?.id ? "Brand edited!" : "Brand created!");
      onClose();
    }
  }, [state]);

  return (
    <Modal
      onClose={onClose}
      title={editable?.id ? `Edit ${editable.name} Brand` : "Add New Brand"}
    >
      <form
        id={form.id}
        onSubmit={form.onSubmit}
        action={action}
        className="space-y-7 pt-6"
      >
        {/* Name Field */}
        <FormInput
          key={fields.name.key}
          name={fields.name.name}
          defaultValue={fields.name?.initialValue as string | undefined}
          error={fields.name.errors}
          placeholder="Enter name"
          label="Name"
        />

        {/* Image field with preview */}
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
                setSelectedImage(file);
                setPreview(URL.createObjectURL(file));
              }
            }}
          />
        </div>

        <div className="flex justify-end gap-5">
          <Button type="submit" className="max-w-min">
            {editable?.id ? "Edit Brand" : "Create Brand"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BrandModal;
