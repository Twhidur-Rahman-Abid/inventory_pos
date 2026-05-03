"use client";

import React, { useActionState, useEffect, useState } from "react";

import Image from "next/image";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// import error from "@/app/dashboard/error";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Loading from "../ui/Loading";
import Link from "next/link";

const LoginForm = () => {
  const [passwordInputType, setPasswordInputType] = useState("password");
  //   const [state, action, isPending] = useActionState(authAction);
  //   const { error: resError, success } = state || {};

  const router = useRouter();

  //   useEffect(() => {
  //     if (resError) {
  //       toast.error(
  //         typeof resError === "string"
  //           ? resError
  //           : resError?.username || resError?.password || "Something went wrong",
  //       );
  //     }
  //   }, [resError]);

  //   useEffect(() => {
  //     if (success) {
  //       toast.success("User logged in successfully");
  //       router.push("/dashboard");
  //     }
  //   }, [success, router]);

  return (
    <form className="my-6 space-y-3 md:space-y-4.5">
      {/* {typeof resError !== "object" && (
        <p className="text-red-500 text-center">{resError}</p>
      )} */}

      <Input
        type="text"
        name="username"
        placeholder="User ID"
        error={""}
        LeftIcon={<LeftIcon iconImgPath="/i-user.svg" />}
      />
      <Input
        type={passwordInputType}
        name="password"
        error={""}
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

      <Link href="/dashboard">
        <Button type="submit" className="bg-secondary border border-stock/10">
          Login
          {/* {isPending ? <Loading /> : "Login"} */}
        </Button>
      </Link>
    </form>
  );
};

export default LoginForm;

function LeftIcon({ iconImgPath = "" }) {
  return (
    <>
      <Image src={iconImgPath} alt={iconImgPath} width={24} height={24} />
      <div className="w-[1px] h-[19px] bg-c-gray mx-3 md:mx-6"></div>
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
