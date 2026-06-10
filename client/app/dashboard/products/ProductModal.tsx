/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useActionState, useEffect, useState } from "react";

import {
  Button,
  Modal,
  ToggleSwitch,
  FormFile,
  FormInput,
  FormSelect,
} from "@/app/_components";

import useFetchWAuth from "@/app/_hooks/useAuthFetch";
import { postData, putData } from "@/app/_actions";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { ProductSchema } from "@/app/_schema/schema";
import { toast } from "react-toastify";
import { CategoryType, ProductType } from "@/app/_types/types";
import { InputSkeleton } from "@/app/_components/ui/Skeleton";

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

// ---------------- Main Modal ----------------
const ProductModal = ({
  onClose = () => {},
  fetcher = () => {},
  editable,
}: {
  onClose: () => void;
  fetcher?: () => void;
  editable?: null | (Partial<ProductType> & { open?: boolean });
}) => {
  // TODO: implement sku generate
  const [sku, setSku] = useState("");

  // Fetch Category
  const { data: categories, isLoading: isCategoryLoading } = useFetchWAuth<{
    count: number;
    data: CategoryType[];
  }>({
    endpoint: "/categories",
  });

  // Fetch editable product based on editable id
  const { data: product, isLoading: productLoading } =
    useFetchWAuth<ProductType>({
      endpoint: `/products/${editable?.id}`,
      isFetch: editable?.id ? true : false,
    });

  // Editable product dist
  const defaultProduct = product?.id ? product : null;
  const { thumbnail, images, ...editableProduct } =
    defaultProduct || ({} as ProductType);
  const defaultEditable = editableProduct
    ? { ...editableProduct, description: defaultProduct?.details?.description }
    : null;

  // Offer state
  const [offerOpen, setOfferOpen] = useState(
    !!editableProduct?.is_buy_one_get_one ||
      !!editableProduct?.discount_percentage,
  );

  const [isOneBuyOne, setIsOneBuyOne] = useState(
    editableProduct?.is_buy_one_get_one || false,
  );

  // Images State
  // Product Img list - Img File - Delete able img id
  const [imageList, setImageList] = useState<
    { id?: number; image_url?: string }[]
  >([{}]);
  const [imagesFile, setImagesFile] = useState<File[]>([]);
  const [deletedImages, setDeletedImages] = useState<number[]>([]);

  // Product Description
  const [description, setDescription] = useState(
    defaultProduct?.details?.description || "",
  );

  useEffect(() => {
    if (images && images.length > 0) {
      setImageList(
        images.map((img) =>
          typeof img === "string" ? { image_url: img } : img,
        ),
      );
    }
  }, [images]);

  // Action
  const [state, action] = useActionState(
    async (_: unknown, formData: FormData) => {
      if (imagesFile.length > 0)
        imagesFile.forEach((f) => formData.append("images", f));

      if (editable?.id && deletedImages?.length)
        deletedImages.forEach((id) =>
          formData.append("deleted_image_ids", String(id)),
        );

      if (description) formData.append("description", description);

      return editable?.id
        ? await putData({
            endpoint: `/products/${editable?.id}`,
            formData,
            schemaName: "product",
          })
        : await postData({
            endpoint: "/products/",
            formData,
            schemaName: "product",
          });
    },
    editable?.id ? editable : undefined,
  );

  // Handle Form
  const [form, fields] = useForm({
    id: productLoading ? "loading" : `product-${product?.id || "new"}`,
    lastResult: state?.lastResult,
    defaultValue: state?.lastResult?.initialValue ||
      defaultEditable || { images: [""] },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ProductSchema });
    },

    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  // TODO: implement sku generate
  const handleSku = () => {
    setSku("edfdsdg");
  };

  // Toast after form action
  useEffect(() => {
    if (state?.status === "success") {
      fetcher();
      toast.success(editable?.id ? "Product edited!" : "Product created!");
      onClose();
    } else if (state?.status === "error") {
      toast.error(state?.message);
    }
  }, [state]);

  return (
    <Modal onClose={onClose} title="Add Product">
      <p className="text-secondary text-md font-medium pb-4 mt-4 border-b border-c-gray ">
        Product Details
      </p>
      {editable?.id && productLoading ? (
        <ProductModalSkeleton />
      ) : (
        <form
          id={form.id}
          onSubmit={form.onSubmit}
          action={action}
          className="space-y-7.5 pt-6"
        >
          <FormInput
            name={fields.name.name}
            defaultValue={fields.name?.initialValue as string | undefined}
            error={fields.name.errors}
            label="Product name"
          />

          {/* Description Editor */}
          <div className="flex flex-col gap-3 w-full">
            <label
              htmlFor={"description"}
              className="text-secondary font-medium text-base"
            >
              Description
            </label>

            <SimpleEditor
              value={product?.details?.description}
              onChange={(value) => setDescription(value)}
            />
          </div>

          {/* SKU Code and Category */}
          <div className="flex gap-8 items-end">
            <div className="relative w-full">
              <button
                type="button"
                onClick={handleSku}
                className="absolute right-0"
              >
                Generate
              </button>

              <FormInput
                name={fields.sku_code.name}
                defaultValue={
                  fields.sku_code?.initialValue as string | undefined
                }
                error={fields.sku_code.errors}
                label="SKU/Code"
              />
            </div>

            {isCategoryLoading ? (
              <InputSkeleton label="Category" />
            ) : (
              <FormSelect
                name={fields.category_id.name}
                error={fields.category_id.errors}
                defaultValue={product?.category_id}
                label="Category"
                options={categories?.data}
              />
            )}
          </div>

          {/* Price */}
          <FormInput
            name={fields.price.name}
            defaultValue={fields.price?.initialValue as string | undefined}
            error={fields.price.errors}
            type="number"
            label="Price"
          />

          {/* Quantity */}
          <FormInput
            name={fields.quantity.name}
            defaultValue={fields.quantity?.initialValue as string | undefined}
            error={fields.quantity.errors}
            type="number"
            label="Quantity"
          />

          {/* Offer Details */}
          <div className="flex justify-between border-b border-c-gray pb-4">
            <p className="text-secondary text-md font-medium ">Offer Details</p>
            <ToggleSwitch
              checked={offerOpen}
              onChange={() => setOfferOpen(!offerOpen)}
            />
          </div>
          {offerOpen && (
            <div className="flex gap-8 items-start">
              <FormInput
                name={fields.discount_percentage.name}
                defaultValue={
                  fields.discount_percentage?.initialValue as string | undefined
                }
                error={fields.discount_percentage.errors}
                label="Discount"
              />
              <div className="flex flex-col gap-5 w-full">
                <label
                  htmlFor={"description"}
                  className="text-secondary font-medium text-base"
                >
                  Is buy one get one
                </label>
                <ToggleSwitch
                  name={fields.is_buy_one_get_one.name}
                  checked={isOneBuyOne}
                  onChange={() => setIsOneBuyOne(!isOneBuyOne)}
                />
              </div>
            </div>
          )}

          <div>
            <p className="text-secondary text-md font-medium pb-4 mt-4 border-b border-c-gray ">
              Display Image
            </p>
            <FormFile
              label="Thumbnail"
              name={fields.thumbnail.name}
              accept="image/png, image/jpeg"
              previewImg={thumbnail}
            />
          </div>

          {/* Product images */}
          <div className="border p-4 rounded-xl border-dashed border-stock/30">
            <p className="text-secondary text-md font-medium pb-4 mt-4 border-b border-c-gray ">
              Product Images
            </p>

            <div className="space-y-6">
              {imageList?.map((imgField, index: number) => (
                <div
                  key={index}
                  className="relative border-b border-dashed border-stock/30 "
                >
                  <FormFile
                    previewImg={imgField.image_url}
                    label={`Product image ${index + 1}`}
                    accept="image/png, image/jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImagesFile((prev) => [...prev, file]);
                      }
                      const imageId = imgField.id;
                      if (typeof imageId === "number") {
                        setDeletedImages((prev) => [...prev, imageId]);
                      }
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const imageId = imgField.id;
                      if (typeof imageId === "number") {
                        setDeletedImages((prev) => [...prev, imageId]);
                      }
                      setImageList(imageList.filter((v, i) => i !== index));
                      setImagesFile(imagesFile.filter((v, i) => i !== index));
                    }}
                    className="text-red-500 text-sm my-2 block ml-auto hover:underline"
                  >
                    Remove Image
                  </button>
                </div>
              ))}

              {imageList?.length < 4 && (
                <Button
                  type="button"
                  className="max-w-fit"
                  onClick={() => setImageList((prev) => [...prev, {}])}
                >
                  + Add Image
                </Button>
              )}
            </div>
          </div>
          <Button type="submit">Submit</Button>
        </form>
      )}
    </Modal>
  );
};

export default ProductModal;

function ProductModalSkeleton() {
  return (
    <div className="space-y-7.5 pt-6">
      <InputSkeleton label="Product name" />
      <InputSkeleton label="Description" />
      <div className="flex gap-8 items-end">
        <div className="relative w-full">
          <InputSkeleton label="SKU/Code" />
        </div>

        <InputSkeleton label="Category" />
      </div>
      <InputSkeleton label="Price" />
      <InputSkeleton label="Quantity" />

      <p className="text-secondary text-md font-medium pb-4 mt-4 border-b border-c-gray ">
        Display Image
      </p>
      <InputSkeleton label="Thumbnail" />
    </div>
  );
}
