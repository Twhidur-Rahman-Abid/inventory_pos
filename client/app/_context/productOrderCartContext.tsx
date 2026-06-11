"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CategoryType, FetchStatus, ProductType } from "../_types/types";
import { toast } from "react-toastify";
import useFetchWAuth from "../_hooks/useAuthFetch";

export type CartType = ProductType & {
  qty: number;
};

type ProductOrderCartContextType = {
  carts: CartType[];
  addToCart: (product: CartType) => void;
  incrementCartQty: (product: CartType, qty: number) => void;
  decrementCartQty: (product: CartType, qty: number) => void;
  removeCart: (id: number) => void;
  clearCart: () => void;
  handleProductQuantity: (items: { product_id: number; qty: number }[]) => void;
  selectedCategory: CategoryType;
  setSelectedCategory: Dispatch<SetStateAction<CategoryType>>;
  isPrintOpen: boolean;
  setIsPrintOpen: Dispatch<SetStateAction<boolean>>;
  productState: {
    products: ProductType[];
    productsLoading: boolean;
    productsStatus: FetchStatus;
    productsError?: string | null;
    productCount?: number;
    fetchProducts: () => void;
  };
};

const productOrderCartContext = createContext<ProductOrderCartContextType>(
  {} as ProductOrderCartContextType,
);

export const useCart = () => {
  const ctx = use(productOrderCartContext);

  if (!ctx) {
    throw new Error("useCart must be used inside ProductOrderCartProvider");
  }

  return ctx;
};

export const ProductOrderCartProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>({
    id: "all",
    name: "All",
  });

  const [carts, setCarts] = useState<CartType[]>([]);
  const [products, setProducts] = useState<ProductType[]>([]);

  // fetch products
  const {
    data: { count: productCount, data } = {},
    isLoading: productsLoading,
    status: productsStatus,
    error: productsError,
    fetcher: fetchProducts,
  } = useFetchWAuth<{
    count: number;
    data: ProductType[];
  }>({
    endpoint: "/stocks?pagination=false",
  });

  // Sync fetched products into local state
  useEffect(() => {
    if (data?.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProducts(data);
    }
  }, [data]);

  // Add product to cart
  const addToCart = useCallback(
    (product: CartType) => {
      const exists = carts.some((item) => item.id === product.id);

      if (exists) {
        toast.warning(`${product.name} is already in the cart`);
        return;
      }

      if (product.qty > product.quantity) {
        toast.warning(`Only ${product.quantity} item(s) available`);
        return;
      }

      setCarts((prev) => [...prev, product]);

      toast.success(`${product.name} added to cart`);
    },
    [carts],
  );

  // Increase cart quantity
  const incrementCartQty = useCallback((product: CartType, qty: number) => {
    if (product.qty + qty > product.quantity) {
      toast.warning(`Only ${product.quantity} item(s) available`);
      return;
    }

    setCarts((prev) =>
      prev.map((item) =>
        item.id === product.id
          ? {
              ...item,
              qty: item.qty + qty,
            }
          : item,
      ),
    );
  }, []);

  // Decrease cart quantity
  const decrementCartQty = useCallback((product: CartType, qty: number) => {
    if (product.qty - qty < 1) {
      toast.warning("Quantity cannot be less than 1");
      return;
    }

    setCarts((prev) =>
      prev.map((item) =>
        item.id === product.id
          ? {
              ...item,
              qty: item.qty - qty,
            }
          : item,
      ),
    );
  }, []);

  // Remove a product from cart
  const removeCart = useCallback((id: number) => {
    setCarts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Clear all cart items
  const clearCart = useCallback(() => {
    setCarts([]);
  }, []);

  // Update local product stock after successful order
  const handleProductQuantity = useCallback(
    (items: { product_id: number; qty: number }[]) => {
      const qtyMap = new Map(items.map((item) => [item.product_id, item.qty]));

      setProducts((prev) =>
        prev.map((product) => {
          const soldQty = qtyMap.get(product.id);

          if (!soldQty) return product;

          return {
            ...product,
            quantity: product.quantity - soldQty,
          };
        }),
      );
    },
    [],
  );

  // Memoized product state
  const productState = useMemo(
    () => ({
      products,
      productsLoading,
      productsStatus,
      productsError,
      fetchProducts,
      productCount,
    }),
    [
      products,
      productsLoading,
      productsStatus,
      productsError,
      fetchProducts,
      productCount,
    ],
  );

  // Memoized context value
  const value = useMemo(
    () => ({
      carts,
      addToCart,
      incrementCartQty,
      decrementCartQty,
      removeCart,
      clearCart,
      handleProductQuantity,
      selectedCategory,
      setSelectedCategory,
      productState,
      isPrintOpen,
      setIsPrintOpen,
    }),
    [
      carts,
      addToCart,
      incrementCartQty,
      decrementCartQty,
      removeCart,
      clearCart,
      handleProductQuantity,
      selectedCategory,
      productState,
      isPrintOpen,
      setIsPrintOpen,
    ],
  );

  return (
    <productOrderCartContext.Provider value={value}>
      {children}
    </productOrderCartContext.Provider>
  );
};
