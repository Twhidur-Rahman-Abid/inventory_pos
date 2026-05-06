import Image from "next/image";

export default function DashboardStats({
  total = 0,
  icon = "",
  title = "",
  percentage = 0,
}) {
  const isFall = percentage < 0;
  return (
    <div className="py-3 md:py-4 px-4 md:px-5 grow max-w-90 rounded-xl bg-white shadow-2 flex justify-between items-center">
      <div className="space-y-2.5">
        <h4 className="text-c-green text-[28px] leading-8 font-semibold">
          {total}
        </h4>
        <p className="text-14 text-secondary font-medium"> {title}</p>
      </div>

      <div className="space-y-2.5">
        <Image
          src={icon || "/placeholder-img.svg"}
          alt="product"
          width={40}
          height={40}
        />
        <div
          className={`py-0.5 px-1.5  flex items-center rounded-full ${
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
