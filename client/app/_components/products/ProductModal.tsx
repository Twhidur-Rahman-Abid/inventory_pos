/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Button,
  Icon,
  InputGroup,
  Modal,
  Select,
  ToggleSwitch,
} from "@/app/_components";

// UI components (kept)
// import Button from "@/components/Button";
// import InputGroup from "@/components/product/InputGroup";
// import Select from "@/components/Select";
// import Icon from "@/components/ui/Icon";
// import Modal from "@/components/ui/Modal";
// import ToggleSwitch from "@/components/ui/ToggleSwitch";

// types
interface ImageItem {
  id?: number;
  file: File | null;
  preview: string;
}

interface ProductModalProps {
  onClose: () => void;
}

// ---------------- Image Upload ----------------
const ProductImageUpload = ({
  images,
  setImages,
}: {
  images: ImageItem[];
  setImages: React.Dispatch<React.SetStateAction<ImageItem[]>>;
}) => {
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    const updated = [...images];
    updated[index] = { ...updated[index], file, preview };
    setImages(updated);
  };

  const handleAddField = () => {
    setImages([...images, { file: null, preview: "/placeholder-img.svg" }]);
  };

  const handleRemove = (index: number) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  return (
    <div className="space-y-4">
      {images.map((img, index) => (
        <div key={index} className="flex justify-between items-center">
          <div className="py-2.5 text-center w-full">
            <Image
              className="mx-auto size-36 object-contain"
              src={img.preview}
              width={144}
              height={144}
              alt="img"
            />
          </div>

          <div className="w-full">
            <InputGroup
              type="file"
              label={`Product image ${index + 1}`}
              placeholder={img.file?.name || "Choose image"}
              icon={<Icon src="/icon/i-file.svg" />}
              setInputValue={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleFileChange(e, index)
              }
            />

            {images.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="text-red-500 text-sm mt-1"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ))}

      <Button type="button" className="max-w-fit" onClick={handleAddField}>
        + Add Image
      </Button>
    </div>
  );
};

// ---------------- Inventory Image ----------------
const ImageGroup = ({
  image,
  setImage,
}: {
  image: File | null;
  setImage: (file: File | null) => void;
}) => {
  const [preview, setPreview] = useState("/placeholder-img.svg");

  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [image]);

  return (
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

      <div className="w-full">
        <InputGroup
          type="file"
          label="Inventory image"
          placeholder={image?.name || "Choose image"}
          icon={<Icon src="/icon/i-file.svg" />}
          setInputValue={(e: React.ChangeEvent<HTMLInputElement>) =>
            setImage(e.target.files?.[0] || null)
          }
        />
      </div>
    </div>
  );
};

// ---------------- Main Modal ----------------
const ProductModal: React.FC<ProductModalProps> = ({ onClose }) => {
  const [sku, setSku] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [images, setImages] = useState<ImageItem[]>([
    { file: null, preview: "/placeholder-img.svg" },
  ]);
  const [offerOpen, setOfferOpen] = useState(false);

  const handleSku = () => {
    setSku("edfdsdg");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    console.log("FORM DATA:", Object.fromEntries(formData.entries()));
    console.log("Images:", images);
    console.log("Inventory Image:", image);
  };

  return (
    <Modal onClose={onClose} title="Add Product">
      <p className="text-secondary text-md font-medium pb-4 mt-4 border-b border-c-gray ">
        Product Details
      </p>
      <form onSubmit={handleSubmit} className="space-y-7.5 pt-6">
        <InputGroup name="name" label="Product name" />

        <div className="flex gap-8 items-end">
          <div className="relative w-full">
            <button
              type="button"
              onClick={handleSku}
              className="absolute right-0"
            >
              Generate
            </button>

            <InputGroup name="sku_code" label="SKU/Code" setDirectValue={sku} />
          </div>

          <Select
            name="category"
            options={[{ value: "1", label: "Category" }]}
          />
        </div>

        <InputGroup name="selling_price" type="number" label="Price" />

        <div className="flex justify-between border-b border-c-gray pb-4">
          <p className="text-secondary text-md font-medium ">Offer Details</p>
          <ToggleSwitch
            checked={offerOpen}
            onChange={() => setOfferOpen(!offerOpen)}
          />
        </div>

        {offerOpen && (
          <InputGroup name="discount_percentage" label="Discount" />
        )}

        <p className="text-secondary text-md font-medium pb-4 mt-4 border-b border-c-gray ">
          Display Image
        </p>

        <ImageGroup image={image} setImage={setImage} />

        <p className="text-secondary text-md font-medium pb-4 mt-4 border-b border-c-gray ">
          Product Images
        </p>
        <ProductImageUpload images={images} setImages={setImages} />

        <Button type="submit">Submit</Button>
      </form>
    </Modal>
  );
};

export default ProductModal;
