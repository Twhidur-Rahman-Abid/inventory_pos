/* eslint-disable prefer-const */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { postData, putData } from "@/app/_actions";
import { Button, Modal } from "@/app/_components";
import { FormInput } from "@/app/_components/ui/Input";
import { sliderSchema } from "@/app/_schema/schema";
import { HeroSlider } from "@/app/_types/types";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";

const SliderModal = ({
  onClose = () => {},
  fetcher = () => {},
  editable,
}: {
  onClose: () => void;
  fetcher?: () => void;
  editable?: null | Partial<HeroSlider>;
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState(
    editable?.img || "/placeholder-img.svg",
  );

  // Slider data post and put action based on editable data
  const [state, action] = useActionState(
    async (_: unknown, formData: FormData) => {
      if (selectedImage) formData.set("image", selectedImage);
      return editable?.id
        ? await putData({
            endpoint: `/webs/hero-sliders/${editable?.id}`,
            formData,
          })
        : await postData({
            endpoint: "/webs/hero-sliders",
            formData,
          });
    },
    editable?.id ? editable : undefined,
  );

  // Slider form
  const [form, fields] = useForm({
    id: state,
    lastResult: state?.lastResult,
    defaultValue: state?.lastResult?.initialValue || editable || undefined,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: sliderSchema });
    },

    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  useEffect(() => {
    if (state?.status === "error") {
      toast.error(state?.message);
    } else if (state?.status === "success") {
      fetcher();
      toast.success(editable?.id ? "Slider edited!" : "Slider created!");
      onClose();
    }
  }, [state]);

  return (
    <Modal
      onClose={onClose}
      title={editable?.id ? `Edit Slider` : "Add New Slider"}
    >
      <form
        id={form.id}
        onSubmit={form.onSubmit}
        action={action}
        className="space-y-7 pt-6"
      >
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
            {editable?.id ? "Edit Slider" : "Create Slider"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SliderModal;
