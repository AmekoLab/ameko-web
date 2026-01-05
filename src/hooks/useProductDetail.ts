import { useState, useMemo, useCallback } from "react";
import {
  Product,
  ProductOptionValue,
  CartItemInput,
} from "@/src/types/product";

interface UseProductDetailReturn {
  quantity: number;
  setQuantity: (value: number) => void;
  selectedOptions: Record<string, ProductOptionValue>;
  handleSelectOption: (optionId: string, value: ProductOptionValue) => void;
  finalPrice: number;
  handleAddToCart: () => void;
  isAddToCartDisabled: boolean;
  canIncreaseQuantity: boolean;
  canDecreaseQuantity: boolean;
  incrementQuantity: () => void;
  decrementQuantity: () => void;
}

export const useProductDetail = (product: Product): UseProductDetailReturn => {
  // 1. STATE MANAGEMENT

  const [quantity, setQuantity] = useState(1);

  // Initialize với default values của mỗi option
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, ProductOptionValue>
  >(() => {
    const defaults: Record<string, ProductOptionValue> = {};

    if (product?.options) {
      product.options.forEach((opt) => {
        // Chỉ set default nếu có values
        if (opt.values && opt.values.length > 0) {
          defaults[opt.id] = opt.values[0];
        }
      });
    }

    return defaults;
  });

  // 2. COMPUTED VALUES

  // Calculate final price với memoization
  const finalPrice = useMemo(() => {
    let total = product?.basePrice || 0;

    Object.values(selectedOptions).forEach((optionValue) => {
      if (optionValue?.priceModifier) {
        total += optionValue.priceModifier;
      }
    });

    return total;
  }, [product?.basePrice, selectedOptions]);

  // Check xem có thể add to cart không
  const isAddToCartDisabled = useMemo(() => {
    // Không có product
    if (!product) return true;

    // Quantity invalid
    if (quantity < 1) return true;

    // Stock check (nếu có)
    if (
      product.stockQuantity !== undefined &&
      quantity > product.stockQuantity
    ) {
      return true;
    }

    return false;
  }, [product, quantity]);

  const canIncreaseQuantity = useMemo(() => {
    if (!product?.stockQuantity) return true; // Unlimited stock
    return quantity < product.stockQuantity;
  }, [product, quantity]); // Changed from [product?.stockQuantity, quantity]

  const canDecreaseQuantity = useMemo(() => {
    return quantity > 1;
  }, [quantity]);

  // 3. EVENT HANDLERS

  const handleSelectOption = useCallback(
    (optionId: string, value: ProductOptionValue) => {
      setSelectedOptions((prev) => ({
        ...prev,
        [optionId]: value,
      }));
    },
    []
  );

  const incrementQuantity = useCallback(() => {
    setQuantity((prev) => {
      if (!product?.stockQuantity) return prev + 1;
      return Math.min(prev + 1, product.stockQuantity);
    });
  }, [product]); // Changed from [product?.stockQuantity]

  const decrementQuantity = useCallback(() => {
    setQuantity((prev) => Math.max(1, prev - 1));
  }, []);

  const handleAddToCart = useCallback(() => {
    if (isAddToCartDisabled || !product) {
      console.warn("Cannot add to cart: validation failed");
      return;
    }

    // Keep the full objects instead of converting to IDs
    const cartItem: CartItemInput = {
      productId: product.id,
      quantity,
      selectedOptions: selectedOptions,
      finalPrice,
    };

    console.log("🛒 Adding to Cart:", {
      product: product.name,
      quantity,
      options: selectedOptions,
      totalPrice: finalPrice,
    });

    // TODO: Implement actual cart logic
    // dispatch(addToCart(cartItem));
    // toast.success(`Added ${quantity}x ${product.name} to cart!`);

    alert(
      `✅ Added ${quantity}x ${
        product.name
      } to Cart!\nTotal: $${finalPrice.toFixed(2)}`
    );
  }, [isAddToCartDisabled, product, quantity, selectedOptions, finalPrice]);

  // 4. RETURN

  return {
    // State
    quantity,
    setQuantity,
    selectedOptions,

    // Computed
    finalPrice,
    isAddToCartDisabled,
    canIncreaseQuantity,
    canDecreaseQuantity,

    // Handlers
    handleSelectOption,
    handleAddToCart,
    incrementQuantity,
    decrementQuantity,
  };
};
