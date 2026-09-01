"use client";

import React, { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/app/_components";

import { authAction } from "@/app/_actions/auth_actions";

// Parent Wrapper Component: Manages the dynamic form key to force re-mounting
export default function LoginForm() {
  const [formKey, setFormKey] = useState(0);

  return (
    <LoginFormContent
      key={formKey}
      resetForm={() => setFormKey((prev) => prev + 1)}
    />
  );
}

// Inner Component: Handles authentication state and form navigation
function LoginFormContent({ resetForm }: { resetForm: () => void }) {
  const [passwordInputType, setPasswordInputType] = useState("password");
  const [state, action, isPending] = useActionState(authAction, null);
  const { errors = {}, message, success } = state || {};
  const router = useRouter();

  useEffect(() => {
    if (success) {
      // 1. Show the success notification
      toast.success("User logged in successfully");

      // 2. Schedule form unmount right after state processing completes
      requestAnimationFrame(() => {
        resetForm();
      });

      // 3. Navigate to dashboard
      router.push("/dashboard");
    } else if (message) {
      toast.error(message);
    }
  }, [success, message, router, resetForm]);

  return (
    <form
      action={action}
      autoComplete="off"
      className="my-6 space-y-3 md:space-y-4.5"
    >
      <Input
        type="text"
        name="username"
        placeholder="username or email"
        autoComplete="off"
        error={errors?.email}
        LeftIcon={<LeftIcon iconImgPath="/i-user.svg" />}
      />
      <Input
        type={passwordInputType}
        name="password"
        autoComplete="new-password"
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
                prev === "password" ? "text" : "password",
              )
            }
          />
        }
      />

      <Button
        type="submit"
        disabled={isPending}
        className="bg-c-green border border-stock/10"
      >
        {isPending ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}

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
