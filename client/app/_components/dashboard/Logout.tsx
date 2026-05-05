"use client";
import React, { useState } from "react";

import Image from "next/image";

import { useRouter } from "next/navigation";

import { createPortal } from "react-dom";
import Loading from "../ui/Loading";
import Button from "../ui/Button";

const Logout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <>
      {/* <form action={logoutAction} className="cursor-pointer"> */}
      <button
        disabled={isPending}
        type="submit"
        onClick={() => setIsModalOpen(!isModalOpen)}
        className="w-full  lg:pl-4.5 py-1.5 md:py-2.5 hover:bg-primary rounded-xl cursor-pointer  "
      >
        {isPending ? (
          <Loading />
        ) : (
          <div className="flex gap-3 items-center justify-center lg:justify-start">
            <svg
              className="size-6"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                {" "}
                <path
                  d="M17.2929 14.2929C16.9024 14.6834 16.9024 15.3166 17.2929 15.7071C17.6834 16.0976 18.3166 16.0976 18.7071 15.7071L21.6201 12.7941C21.6351 12.7791 21.6497 12.7637 21.6637 12.748C21.87 12.5648 22 12.2976 22 12C22 11.7024 21.87 11.4352 21.6637 11.252C21.6497 11.2363 21.6351 11.2209 21.6201 11.2059L18.7071 8.29289C18.3166 7.90237 17.6834 7.90237 17.2929 8.29289C16.9024 8.68342 16.9024 9.31658 17.2929 9.70711L18.5858 11H13C12.4477 11 12 11.4477 12 12C12 12.5523 12.4477 13 13 13H18.5858L17.2929 14.2929Z"
                  fill="#F97316"
                ></path>{" "}
                <path
                  d="M5 2C3.34315 2 2 3.34315 2 5V19C2 20.6569 3.34315 22 5 22H14.5C15.8807 22 17 20.8807 17 19.5V16.7326C16.8519 16.647 16.7125 16.5409 16.5858 16.4142C15.9314 15.7598 15.8253 14.7649 16.2674 14H13C11.8954 14 11 13.1046 11 12C11 10.8954 11.8954 10 13 10H16.2674C15.8253 9.23514 15.9314 8.24015 16.5858 7.58579C16.7125 7.4591 16.8519 7.35296 17 7.26738V4.5C17 3.11929 15.8807 2 14.5 2H5Z"
                  fill="#F97316"
                ></path>{" "}
              </g>
            </svg>
            <p className="hidden lg:block text-md text-[#F97316] font-medium">
              Logout
            </p>
          </div>
        )}
      </button>
      {/* </form> */}

      {isModalOpen &&
        createPortal(
          <div className="fixed bottom-20 left-12 md:left-20  border border-[#6E6D7A]/30  z-[10000]  bg-white lg:w-[40vw] px-7 py-8 rounded-xl shadow-2">
            <svg
              className="mx-auto"
              width={75}
              height={73}
              viewBox="0 0 75 73"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g filter="url(#filter0_d_94_2266)">
                <circle cx="37.1914" cy={36} r={15} fill="white" />
                <circle
                  cx="37.1914"
                  cy={36}
                  r={14}
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                />
              </g>
              <mask
                id="mask0_94_2266"
                style={{ maskType: "alpha" }}
                maskUnits="userSpaceOnUse"
                x={22}
                y={21}
                width={31}
                height={30}
              >
                <circle
                  cx="37.1914"
                  cy={36}
                  r="14.5"
                  fill="white"
                  stroke="black"
                />
              </mask>
              <g mask="url(#mask0_94_2266)">
                <ellipse
                  cx="37.1653"
                  cy="49.265"
                  rx="7.8"
                  ry="8.61623"
                  transform="rotate(89.5691 37.1653 49.265)"
                  fill="var(--color-primary)"
                />
                <circle cx="37.1906" cy="33.8996" r="6.3" fill="#F2A444" />
              </g>
              <circle
                cx="47.2422"
                cy="25.9502"
                r="4.75"
                fill="var(--color-primary)"
                stroke="white"
                strokeWidth={2}
              />
              <defs>
                <filter
                  id="filter0_d_94_2266"
                  x="0.191406"
                  y={-1}
                  width={74}
                  height={74}
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood floodOpacity={0} result="BackgroundImageFix" />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset />
                  <feGaussianBlur stdDeviation={11} />
                  <feComposite in2="hardAlpha" operator="out" />
                  <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0.12549 0 0 0 0 0.552941 0 0 0 0 0.996078 0 0 0 0.08 0"
                  />
                  <feBlend
                    mode="normal"
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_94_2266"
                  />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="effect1_dropShadow_94_2266"
                    result="shape"
                  />
                </filter>
              </defs>
            </svg>

            <div className="text-center text-secondary space-y-4  md:space-y-6 mt-4 md:mt-6">
              <p className="text-lg font-semibold">Come back soon 👋</p>
              <p className="text-12 text-[#6E6D7A]">
                It is only through teamwork that dreams come true. Are you sure
                want to log out?
              </p>

              <div className="flex gap-4  md:gap-6">
                <Button
                  onClick={() => setIsModalOpen(false)}
                  type="button"
                  className="bg-transparent border border-[#6E6D7A] text-[#6E6D7A]"
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleLogout}
                  disabled={isPending}
                  className="bg-denger"
                >
                  {isPending ? <Loading isBlack /> : "Logout"}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default Logout;
