import useFetchWAuth from "@/app/_hooks/useAuthFetch";
import DashboardProductCard, {
  DashboardProductCardSkeletonList,
} from "./DashboardProductCard";

type Product = {
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

const LowStock = () => {
  const { data, isLoading } = useFetchWAuth<Product[]>({
    endpoint: "/dashboard/low-stock",
  });

  return (
    <div className="mt-5 bg-white shadow-2 rounded-[18px] p-4 md:p-4 min-w-[300px] w-full">
      <h3 className="text-lg text-denger font-medium pb-3 border-b border-colorBorder mb-6">
        Low Stock
      </h3>
      {isLoading ? (
        <DashboardProductCardSkeletonList />
      ) : (
        data?.map((v) => (
          <DashboardProductCard
            key={v.name}
            name={v.name}
            src={v.image}
            price={v.price}
            total={v.quantity}
            totalTitle="Stock"
          />
        ))
      )}
    </div>
  );
};

export default LowStock;
