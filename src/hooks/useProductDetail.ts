// src/hooks/useProductDetail.ts
import { useState, useMemo } from "react";
import {
  Product,
  ProductOptionValue,
  CartItemInput,
} from "@/src/types/product";

export const useProductDetail = (product: Product) => {
  const [quantity, setQuantity] = useState(1);

  // State lưu các option đang chọn: { color: OptionValue, plate: OptionValue }
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, ProductOptionValue>
  >(() => {
    const defaults: Record<string, ProductOptionValue> = {};
    if (product?.options) {
      product.options.forEach((opt) => {
        if (opt.values?.length > 0) defaults[opt.id] = opt.values[0];
      });
    }
    return defaults;
  });

  const handleSelectOption = (optionId: string, value: ProductOptionValue) => {
    setSelectedOptions((prev) => ({ ...prev, [optionId]: value }));
  };

  const finalPrice = useMemo(() => {
    let total = product.basePrice;
    Object.values(selectedOptions).forEach((opt) => {
      if (opt.priceModifier) total += opt.priceModifier;
    });
    return total;
  }, [product.basePrice, selectedOptions]);

  // 4. Logic Add to Cart
  const handleAddToCart = () => {
    const cartItem: CartItemInput = {
      productId: product.id,
      quantity,
      selectedOptions,
      finalPrice,
    };

    console.log("🛒 Added to Cart:", cartItem);
    // TODO: Dispatch Redux action here -> dispatch(addToCart(cartItem))
    // toast.success("Added to cart successfully!");
    alert(`Added ${quantity} x ${product.name} to Cart!`);
  };

  return {
    quantity,
    setQuantity,
    selectedOptions,
    handleSelectOption,
    finalPrice,
    handleAddToCart,
  };
};
