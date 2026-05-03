import Image from "next/image";
import LoginForm from "./_components/auth/LoginForm";
import logo from "@/public/logo.svg";
const page = async () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="flex flex-col md:flex-row gap-10 xl:gap-30 container items-center justify-center  ">
        <div className=" w-[90%] md:w-auto md:max-w-105  border  border-gray-200 rounded-xl input-shadow p-3 md:p-5 lg:p-8">
          <Image src={logo} alt="logo" className="w-32" />

          <h2 className="font-semibold text-3xl md:text-4xl text-secondary mt-8 md:mt-10">
            Admin & Staff Login
          </h2>
          <p className="font-medium text-body-text">
            <span className="text-primary">Niamah Shop</span> admin panel
          </p>

          <LoginForm />
          <p className="text-body-text text-sm font-normal">
            Thank you for choosing{" "}
            <span className="text-primary italic mt-10 md:mt-15 underline">
              TRA Tech!
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default page;
