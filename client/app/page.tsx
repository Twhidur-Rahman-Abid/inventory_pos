import LoginForm from "./_components/auth/LoginForm";

const page = async () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="flex flex-col md:flex-row gap-10 xl:gap-30 container items-center justify-center  input-shadow">
        <div className="p-3 w-[90%] md:w-auto md:max-w-105 md:p-0 border md:border-0 border-gray-200 rounded-xl">
          <h1>Logo</h1>

          <h2 className="font-semibold text-3xl md:text-4xl text-secondary mt-8 md:mt-[60px]">
            Admin & Staff Login
          </h2>
          <p className="font-medium text-body-text">
            <span className="text-primary">High Zalerance</span> admin panel
          </p>

          <LoginForm />
          <p className="text-body-text text-sm font-normal">
            Thank you for choosing{" "}
            <span className="text-primary italic mt-[60px]">
              Byte Engineers!
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default page;
