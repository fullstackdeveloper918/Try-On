import { callApi } from "@/api/config";
import { exportAsImage } from "@/lib/exportAsImage";
import { RefObject, useEffect, useState } from "react";
import toast from "react-hot-toast";

const BuyButton = ({
  addedProducts,
  earRef,
}: {
  addedProducts: { price: string; variantId: number | undefined }[];
  earRef: RefObject<HTMLDivElement>;
}) => {
  const [totalPrice, setTotalPrice] = useState<number>();
  const callshopifyFunction = async () => {

    const base64Image = await exportAsImage(earRef.current!);
    const formData = new FormData();
    formData.append("image", base64Image!);
    const response = await callApi("orderimage", {
      method: "POST",
      body: formData,
    });
    if (response.ok) {
      const data = await response.json();
      const allVariants = addedProducts.reduce(
        (
          acc: { id: number; quantity: number }[],
          cur: {
            price: string | undefined;
            variantId: number | undefined;
          }
        ) => {
          const existingIdx = acc.findIndex((p) => p?.id == cur.variantId);
          if (existingIdx != -1) {
            acc = [
              ...acc.slice(0, existingIdx),
              { ...acc[existingIdx], quantity: acc[existingIdx].quantity + 1 },
              ...acc.slice(existingIdx + 1),
            ];
          } else {
            acc = [
              ...acc,
              ...(cur.variantId ? [{ id: cur.variantId, quantity: 1 }] : []),
            ];
          }
          return acc;
        },
        []
      );
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      look_add_to_cart(allVariants, data.order_Image_id);
      toast.success("Item added to your cart", {
        position: "top-right"
      });
    }
  };
console.log('totalPrice',totalPrice);

  useEffect(() => {
    setTotalPrice(
      addedProducts.reduce((acc, cur) => {
        const sum = +cur.price ? +acc + +cur.price : acc;
        return sum;
      }, 0)
    );
  }, [addedProducts]);

  return totalPrice ? (
    <button
      className="button product-selector__submit no-js-hidden button--filled button--uppercase lark-berry-buy-button"
      onClick={() => {
        callshopifyFunction();
      }}
    >
      Buy this look
    </button>
  ) : null;
};
export default BuyButton;
