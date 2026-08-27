import useFetchWAuth from "@/app/_hooks/useAuthFetch";
import DashboardProductCard, {
  DashboardProductCardSkeletonList,
} from "./DashboardProductCard";

type Product = {
  name: string;
  price: number;
  total_sold: number;
  thumbnail?: string;
};

const TopSelling = () => {
  const { data, isLoading } = useFetchWAuth<Product[]>({
    endpoint: "/dashboard/top-selling",
  });

  return (
    <div className="mt-5 bg-white shadow-2 rounded-[18px] p-4 md:p-4 w-full min-w-[300px]">
      <h3 className="text-c-green text-lg font-bold pb-3 border-b border-colorBorder mb-6">
        Top Selling
      </h3>
      {isLoading ? (
        <DashboardProductCardSkeletonList />
      ) : (
        data?.map((v) => (
          <DashboardProductCard
            key={v.name}
            name={v.name}
            src={v.thumbnail}
            price={v.price}
            total={v.total_sold}
          />
        ))
      )}
    </div>
  );
};

export default TopSelling;
