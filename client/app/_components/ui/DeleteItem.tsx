import React, { useState } from "react";
import { SimpleModal } from "./Modal";
import Button from "./Button";
import Loading from "./Loading";
import Icon from "./Icon";
import { deleteData } from "@/app/_actions";
import { toast } from "react-toastify";

const DeleteItem = ({
  endpoint,
  fetcher,
  title = "Item",
}: {
  endpoint: string;
  fetcher?: () => void;
  title?: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const onClose = () => setModalOpen(false);
  const handleDelete = async (isDelete = true) => {
    if (!isDelete) {
      onClose();
      return;
    }
    setLoading(true);
    const res = await deleteData(endpoint);
    setLoading(false);
    if (res?.success) {
      onClose();
      toast.success(`${title} deleted!`);
      if (fetcher) fetcher();
    } else {
      toast.error(res?.message);
    }
  };
  return (
    <>
      <Icon
        src="/icon/i-delete.svg"
        onClick={() => setModalOpen(true)}
        size={24}
      />
      {modalOpen && (
        <SimpleModal onClose={onClose}>
          <p className="text-lg font-semibold text-center text-[#F34150]">
            Delete {title}
          </p>
          <p className="text-center text-[#6E6D7A] mt-2">
            Do you really want to delete this {title.toLowerCase()}?
          </p>
          <div className="flex gap-3 justify-between mt-8">
            <Button
              onClick={() => handleDelete(false)}
              className="bg-white border border-c-gray text-body-text "
            >
              No
            </Button>
            <Button onClick={() => handleDelete(true)} className="bg-[#F34150]">
              {loading ? <Loading isBlack /> : "Yes"}
            </Button>
          </div>
        </SimpleModal>
      )}
    </>
  );
};

export default DeleteItem;
