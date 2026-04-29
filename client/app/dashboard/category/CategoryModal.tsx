/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Button, Icon, InputGroup, Modal, Select } from "@/app/_components";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const ImageGroup = ({
  image,
  label = "",
  setImage,
}: {
  label: string;
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
          label={label}
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

interface CategoryModalProps {
  onClose: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ onClose }) => {
  const [image, setImage] = useState<File | null>(null);

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
    <Modal onClose={onClose} title="Add New Category">
      <form onSubmit={handleSubmit} className="space-y-[30px] pt-6">
        <InputGroup
          name="first_name"
          label="Category Name"
          placeholder="Enter category name"
        />
        <ImageGroup label="Category Image" setImage={setImage} image={image} />

        <div className="flex justify-end gap-5">
          <Button
            onClick={handleReset}
            className="text-body-text bg-c-gray max-w-min"
          >
            Reset
          </Button>

          <Button type="submit" className="max-w-min">
            Create Category
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryModal;
