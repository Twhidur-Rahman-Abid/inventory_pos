"use client";
import React, { useEffect, ReactNode } from "react";
import Icon from "./Icon";
import { createPortal } from "react-dom";

const Modal = ({
  title = "",
  onClose = () => {},
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) => {
  useEffect(() => {
    document.body.style.overflow = "hidden"; // Disable scrolling

    // Clean up on component unmount or when modal is closed
    return () => {
      document.body.style.overflow = "auto"; // Ensure scrolling is enabled on unmount
    };
  }, []);
  return createPortal(
    <>
      <div
        onClick={onClose}
        className="fixed top-0 left-0 min-h-screen h-full w-full bg-black/20 backdrop-blur-[4px] z-[400]"
      ></div>
      <div className="fixed top-[45vh] left-1/2 -translate-1/2 z-[410] max-h-[80vh] overflow-auto scale-[.65] md:scale-100 bg-white lg:w-[45vw]  lg:max-w-[800px] px-7 pb-8 rounded-xl">
        <div className="py-[18px] w-full border-b border-[#E2E2E2] relative">
          <p className="text-2xl font-semibold text-secondary text-center min-w-100 ">
            {title}
          </p>
          <Icon
            className="absolute right-4 top-4"
            src="/icon/i-close.svg"
            size={30}
            onClick={onClose}
          />
        </div>
        {children}
      </div>
    </>,
    document.body,
  );
};

export default Modal;
