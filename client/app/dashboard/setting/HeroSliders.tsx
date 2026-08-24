"use client";
import { Button, DeleteItem, Icon, ToggleSwitch } from "@/app/_components";
import { ErrorMessage, NotFoundMessage } from "@/app/_components/ui/Alert";
import Loading from "@/app/_components/ui/Loading";
import useFetchWAuth from "@/app/_hooks/useAuthFetch";
import { HeroSlider } from "@/app/_types/types";
import Image from "next/image";
import React, { useState } from "react";
import SliderModal from "./SliderModal";
import { toast } from "react-toastify";
import { putData, putJSONData } from "@/app/_actions";

const HeroSliders = () => {
  const [modalData, setModalData] = useState<{
    open: boolean;
    editable?: Partial<HeroSlider>;
  }>({ open: false });

  // fetch slider
  const { data, isLoading, status, error, fetcher } = useFetchWAuth<
    HeroSlider[]
  >({
    endpoint: "/webs/hero-sliders",
  });

  // switch active
  const switchActive = async (is_active: boolean, id: number) => {
    const toastId = toast.loading(`Slider status updating...`);
    const formData = new FormData();
    formData.append("is_active", String(is_active));

    const res = await putData({
      endpoint: `/webs/hero-sliders/${id}/`,
      formData,
    });

    if (res?.status === "success") {
      fetcher();
      toast.done(toastId);
      toast.success("Status updated!");
    } else {
      toast.done(toastId);
      toast.error(res?.message);
    }
  };

  let sliderContent = null;
  if (isLoading) sliderContent = <Loading />;
  if (!isLoading && status === "error")
    sliderContent = (
      <ErrorMessage message={error || "There was an error occur!"} />
    );
  if (!isLoading && status === "success" && data?.length === 0)
    sliderContent = (
      <NotFoundMessage message="Hero slider not found! Create new one" />
    );
  if (!isLoading && status === "success" && data?.length > 0)
    sliderContent = (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        {data.map((slider) => {
          const { id, img, is_active } = slider;
          return (
            <div key={id}>
              <Image
                src={img}
                alt="slider"
                width={600}
                height={400}
                className="object-contain"
              />
              <div className="w-full mt-2.5">
                <div className="text-base text-gray-600 flex justify-between w-full my-2.5 border-t border-b border-gray-200 py-2">
                  <p>Is Active</p>
                  <p>Actions</p>
                </div>
                <div className="text-base text-gray-600 flex justify-between w-full">
                  <ToggleSwitch
                    checked={is_active}
                    onChange={() => switchActive(!is_active, id)}
                  />
                  <div className="flex gap-3 min-w-max items-center justify-end w-full">
                    <Icon
                      onClick={() =>
                        setModalData({
                          open: true,
                          editable: slider,
                        })
                      }
                      src="/icon/i-edit-pen.svg"
                      size={24}
                    />

                    <DeleteItem
                      endpoint={`/webs/hero-sliders/${id}`}
                      fetcher={fetcher}
                      title={`Slider`}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  return (
    <div className="card-wrapper">
      <div className="flex justify-between flex-col sm:flex-row items-center gap-6">
        <h3 className="text-2xl font-bold pb-6">Hero Sliders</h3>
        <Button
          className="border-none px-3.5 sm:max-w-fit"
          onClick={() => setModalData({ open: true })}
        >
          ADD Slider
          <Icon src="/icon/i-plus.svg" className="hidden md:inline-block" />
        </Button>
      </div>
      <div className="mt-4 md:mt-6 lg:mt-8">{sliderContent}</div>
      {modalData.open && (
        <SliderModal
          fetcher={fetcher}
          editable={modalData?.editable}
          onClose={() => setModalData({ open: false })}
        />
      )}
    </div>
  );
};

export default HeroSliders;
