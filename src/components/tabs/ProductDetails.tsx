import { callApi } from "@/api/config";
import { useAnnotationsStore } from "@/store/annotations";
import { useEar } from "@/store/earDetails";
import { useProductDetailsStore } from "@/store/productDetails";
import { Carousel } from "flowbite-react";
import { ChevronLeftCircle, ChevronRightCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { IProduct } from "./data.type";

const ProductDetailsTab = () => {
  const product = useProductDetailsStore((state) => state.product);
  const { annotations, setAnnotations } = useAnnotationsStore();
  const [productDetails, setProductDetails] = useState<IProduct>();
  const side = useEar((state) => state.side);

  const setShowDetails = useProductDetailsStore(
    (state) => state.setShowDetails
  );

  const sideIndex = useMemo(
    () => (side === "L" ? ("left" as const) : ("right" as const)),
    [side]
  );
  useEffect(() => {
    if (product?.id === undefined) return;
    (async () => {
      const response = await callApi("singleproducts/" + product?.id);
      if (response.ok) {
        const singleProduct: { data: IProduct[] } = await response.json();
        setProductDetails(singleProduct.data[0]);
      }
    })();

    // return () => {
    //   setShowDetails(false);
    // };
  }, [product?.id, setShowDetails]);
  console.log("productDetailsproductDetails", productDetails);
  
  const changeVariantColor = async (idx: number) => {
    
    if (product?.position) {
      const images =
        annotations[sideIndex][product.position].options[idx].imagesAll;
      setAnnotations({
        ...annotations,
        [sideIndex]: {
          ...annotations[sideIndex],
          [product.position]: {
            ...annotations[sideIndex][product.position],
            images,
          },
        },
      });
    }
  };

  return (
    <div className="prod-detail-grid">
      <div>
        <div className="goback">
          {/* <button
            onClick={() => {
              setShowDetails(false);
            }}
          >
            <Undo2 className="icon-back" /> Go Back
          </button> */}
          <div
            className="w-7 "
            onClick={() => {
              setShowDetails(false);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="2em"
              viewBox="0 0 384 512"
              className="w-15 cursor-pointer"
            >
              <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
            </svg>
          </div>
        </div>
        <div className="flex flex-col gap-2 justify-start items-start">
          <h2 className="text-2xl leading-6 font-semibold">
            {productDetails?.title}
          </h2>
          <p className="capitalize leading-8 text-base d-none">
            FINE PIERCINGS
          </p>
        </div>
        <div className="price-val">
          <p className="text-lg mt-2">
            {productDetails?.currency_code} {productDetails?.variants[0]?.price}{" "}
            <span className="tax-val">(Tax included)</span>
          </p>
        </div>
        <div className="flex flex-row-reverse items-start w-full galley-prod-detail">
          <div className="img-slider">
            <Carousel
              leftControl={<ChevronLeftCircle />}
              rightControl={<ChevronRightCircle />}
            >
              {productDetails?.images.map((image) => (
                <img
                  key={image?.src}
                  src={image?.src}
                  // className="absolute block max-w-full h-auto -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                  alt=""
                />
              ))}
            </Carousel>
          </div>
          <div className="w-full flex flex-col items-start">
            {productDetails?.variants &&
              productDetails?.variants.length > 1 && (
                <>
                  <h3 className="text-2xl font-semibold mb-4 variant-tt">Select Variant</h3>
                  <div
                    className="flex md:gap-4 gap-0 flex-wrap w-full thumb-prod "
                    key={product?.id}
                  >
                    {productDetails?.variants.map((variant, idx) => {
                      
                      return (
                        <div
                          className="cursor-pointer thumb-prod-item"
                          onClick={() => {
                            changeVariantColor(idx);
                          }}
                        >
                          {productDetails.productShape === "addon" ||
                          productDetails.productShape === "dot" ? (
                            <div className="prod-thumb-img options-area">
                              <img
                                src={variant.imagesAll.dotsImage} 
                                alt=""
                                className="h-24 w-full object-cover border rounded-md"
                              />
                            </div>
                          ) : (
                            <div className="prod-thumb-img">
                              <img
                                src={variant.imagesAll["Dp"]}
                                alt=""
                                className="h-20 w-full object-cover rounded-md"
                              />
                            </div>
                          )}
                          <span className="text-sm">{variant?.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            <button
              className="button product-selector__submit no-js-hidden button--filled button--uppercase btn-addcart"
              onClick={() => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                add_to_single_product(productDetails?.variants[0]?.id);
              }}
            >
              Add to cart
            </button>
          </div>
        </div>

        <div className="text-left desc-data-bottom">
          <h3
            className="text-
        xl"
          >
            Description
          </h3>
          <p
            className="text-left"
            dangerouslySetInnerHTML={{
              __html: productDetails?.body_html ?? "",
            }}
          ></p>
        </div>
      </div>
    </div>
  );
};
export default ProductDetailsTab;
