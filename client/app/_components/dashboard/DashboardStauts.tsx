import Image from "next/image";

export default function DashboardStats({
  total = 0,
  icon = "",
  title = "",
  percentage = 0,
}) {
  const isFall = percentage < 0;
  return (
    <div className="py-3 md:py-4 px-4 md:px-5 grow max-w-90 rounded-xl bg-white shadow-2 space-y-6">
      <div className="w-full flex items-center justify-between gap-4">
        <h4 className="text-c-green text-[28px] 2xl:text-[32px] leading-8 font-semibold">
          {total}
        </h4>
        <Image
          src={icon || "/placeholder-img.svg"}
          alt="product"
          width={50}
          height={50}
          className="size-10 2xl:size-13"
        />
      </div>

      <div className="w-full flex items-center justify-between gap-4">
        <p className="text-14 text-secondary font-medium"> {title}</p>
        <div
          className={`py-[1.5px] px-1.5 lg:px-2.5 flex items-center rounded-full ${
            isFall ? "bg-denger/10" : "bg-c-green/10"
          }`}
        >
          {isFall ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="14"
              viewBox="0 0 15 14"
              fill="none"
            >
              <path
                d="M3.04175 3.73917L3.86425 2.91667L10.0417 9.09417V5.25001H11.2084V11.0833H5.37508V9.91667H9.21925L3.04175 3.73917Z"
                fill="#EB5757"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="14"
              viewBox="0 0 15 14"
              fill="none"
            >
              <path
                d="M4.11425 11.0826L3.29175 10.2601L9.46925 4.08264L5.62508 4.08264V2.91597L11.4584 2.91597L11.4584 8.74931H10.2917L10.2917 4.90514L4.11425 11.0826Z"
                fill="#34C759"
              />
            </svg>
          )}
          <p
            className={`text-12 font-medium ${
              isFall ? "text-denger" : "text-c-green"
            }`}
          >
            {percentage || 0}
          </p>
        </div>
      </div>
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="py-3 md:py-4 px-4 md:px-5 grow max-w-90 rounded-xl bg-white shadow-2 animate-pulse">
      {/* top */}
      <div className="w-full flex items-center justify-between gap-4">
        <div className="h-8 w-24 rounded bg-gray-200" />

        <div className="size-10 2xl:size-13 rounded-full bg-gray-200" />
      </div>

      {/* bottom */}
      <div className="w-full flex items-center justify-between gap-4 mt-6">
        <div className="h-4 w-28 rounded bg-gray-200" />

        <div className="py-[1.5px] px-2.5 flex items-center gap-2 rounded-full bg-gray-100">
          <div className="size-3 rounded-full bg-gray-200" />

          <div className="h-3 w-10 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
