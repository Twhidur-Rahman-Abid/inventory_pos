"use client";

import React, { useActionState, useEffect, useState } from "react";

import Image from "next/image";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/app/_components";

import { authAction } from "@/app/_actions/auth_actions";

const LoginForm = () => {
  const [passwordInputType, setPasswordInputType] = useState("password");
  const [state, action] = useActionState(authAction, null);
  const { errors = {}, message, success } = state || {};

  const router = useRouter();

  useEffect(() => {
    if (success) {
      toast.success("User logged in successfully");
      router.push("/dashboard");
    } else if (message) {
      toast.error(message);
    }
  }, [success, message, router]);

  return (
    <form action={action} className="my-6 space-y-3 md:space-y-4.5">
      {/* {typeof resError !== "object" && (
        <p className="text-red-500 text-center">{resError}</p>
      )} */}

      <Input
        type="text"
        name="email"
        placeholder="User ID"
        error={errors?.email}
        LeftIcon={<LeftIcon iconImgPath="/i-user.svg" />}
      />
      <Input
        type={passwordInputType}
        name="password"
        error={errors?.password}
        placeholder="Password"
        LeftIcon={<LeftIcon iconImgPath="/i-Lock.svg" />}
        RightIcon={
          <RightIcon
            iconImgPath={
              passwordInputType === "password"
                ? "/i-eye.svg"
                : "/icon/i-eye.svg"
            }
            onClick={() =>
              setPasswordInputType((prev) =>
                prev === "password" ? "input" : "password",
              )
            }
          />
        }
      />

      <Button type="submit" className="bg-c-green border border-stock/10">
        Login
      </Button>
    </form>
  );
};

export default LoginForm;

function LeftIcon({ iconImgPath = "" }) {
  return (
    <>
      <Image src={iconImgPath} alt={iconImgPath} width={24} height={24} />
      <div className="w-px h-4.75 bg-c-gray mx-3 md:mx-6"></div>
    </>
  );
}

function RightIcon({ iconImgPath = "", onClick = () => {} }) {
  return (
    <Image
      src={iconImgPath}
      alt={iconImgPath}
      width={24}
      height={24}
      className="ml-3 md:ml-6 cursor-pointer"
      onClick={onClick}
    />
  );
}
