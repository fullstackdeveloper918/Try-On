
import { callApi } from "@/api/config";
import { useEar } from "@/store/earDetails";
import { useProductDetailsStore } from "@/store/productDetails";
import { useProductstore } from "@/store/products";
import { Position } from "@/types/annotations.types";
import { dotPosition } from "@/types/annotations.types";
import { IVariant } from "@/types/variantData.types";
// import Image from "../../public/imgs/image (8).png";
// import MobileView from "./ui/MobileView";
// import Banner from "./ui/Banner";
// import HeaderContent from "./ui/HeaderContent";
//...............Circle image ...............\\
// import ImageA from '../assets/images/LBDJ-092Y-8_A.png'
// import ImageB from "../assets/images/LBDJ-092Y-8_B.png";
// import ImageC from "../assets/images/LBDJ-092Y-8_C.png";
// import ImageD from "../assets/images/LBDJ-092Y-8_D.png";
// import ImageE from "../assets/images/LBDJ-092Y-8_E.png";
// import ImageF from "../assets/images/LBDJ-092Y-8_F.png";

import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
  DragMoveEvent,
  DragStartEvent,
  // closestCorners,
  closestCenter,
} from "@dnd-kit/core";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  dropPointsLeft,
  dropPointsRight,
  dropPointsLeftAddOnLeft,
  dropPointsRightAddOnRight,
  dropPointsForDotCrawleronRight,
  dropPointsForDotCrawleronLeft,
} from "../api/points";
import { useAnnotationsStore } from "../store/annotations";
// import BuyButton from "./BuyButton";
import Ear from "./Ear";
import OptionsMenu from "./OptionsMenu";
import DraggbleComp, {
  DraggableDotComp,
  DraggbleAddOnComp,
} from "./dnd/DraggableComp";
import DroppableComp, {
  DroppableAddOnComp,
  DroppableDotComp,
} from "./dnd/DroppableComp";
import Tabs from "./tabs";
import { IProduct } from "./tabs/data.type";

import { useMediaQuery } from "react-responsive";
import "font-awesome/css/font-awesome.min.css";
import BuyButton from "./BuyButton";
// import { Console } from "console";

// const imageMappings = {
//   A: ImageA,
//   B: ImageB,
//   C: ImageC,
//   D: ImageD,
//   E: ImageE,
//   F: ImageF,
// };

const View = () => {
  const earRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [addedProduts, setAddedProducts] = useState<
    { price: string; variantId: number; shape: string | undefined }[]
  >([]);
  // #TODO : changes needed to make dynamic
  const { products } = useProductstore();
  const annotations = useAnnotationsStore((state) => state.annotations);
  console.log(addedProduts);

  console.log(annotations, "anno");
  const setAnnotations = useAnnotationsStore((state) => state.setAnnotations);
  const { setProduct, showDetails, setShowDetails } = useProductDetailsStore();
  // const [dotPointsEnabled,setDotPointsEnabled] = useState();
  // const [showMessage, setShowMessage] = useState("");
  const [isDragging, setIsDragging] = useState('');

  const [ringType, setRingType] = useState('')

  // const [dropppableAreaAddOn, setDropppableAreaAddOn] = useState({
  //   L: dropPointsLeftAddOnLeft,
  //   R: dropPointsRightAddOnRight,
  // });

  // const [dropppableAreaCircle, setDroppableAreaCircle] = useState({
  //   L: dropPointsLeft,
  //   R: dropPointsRight,
  // });

  // const [dropppableAreaDot, setDroppableAreaDot] = useState({
  //   L: dropPointsForDotCrawleronLeft,
  //   R: dropPointsForDotCrawleronRight,
  // });

  const [dragDataX, setDragDataY] = useState(0);
  // const [ifAddOn, setIfAddOn] = useState(false);
  const side = useEar((state) => state.side);
  const sideIndex = useMemo(
    () => (side === "L" ? ("left" as const) : ("right" as const)),
    [side]
  );
  const [currentPoint, setCurrentPoint] = useState<UniqueIdentifier>();
  const droppableRef = useRef<HTMLDivElement>(null);
  const addProductIdRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });
 
  useEffect(() => {
    if (annotations == undefined) return;
    const leftData = Object.values(annotations["left"])?.map((an) => ({
      price: an?.price ?? "0",
      variantId: an?.variantId,
      shape: an?.shape,
    }));
    const rightData = Object.values(annotations["right"])?.map((an) => ({
      price: an?.price ?? "0",
      variantId: an?.variantId,
      shape: an?.shape,
    }));

    const data = [...leftData, ...rightData];

    setAddedProducts(data);
  }, [annotations, sideIndex]);

  console.log(showDetails, "showDetails");

  type PositionAddonMap = {
    A1: string;
    B1: string;
    C1: string;
    D1: string;
    E1: string;
    F1: string;
  };

  const positionAddonMap: PositionAddonMap = {
    A1: "A",
    B1: "B",
    C1: "C",
    D1: "D",
    E1: "E",
    F1: "F",
  };

  const checkIfCircle = (pos: string | number) => {
    const ifCircle = annotations[sideIndex][pos]?.shape === "circle";
    return ifCircle;
  };

  // Functions 👇👇👇
  async function addProducts(position: UniqueIdentifier, product: IProduct) {
    const productResponse = await callApi(`singleproducts/${product.id}`);
    if (productResponse.ok) {
      setShowDetails(true);
      setProduct({
        id: product.id,
        position: position as Position,
        dotPosition: position as dotPosition,
      });

      setCurrentPoint(position);

      const variantData: { data: [{ variants: IVariant[] }] } =
        await productResponse.json();
      const normalized = variantData.data[0].variants[0];
      if (
        positionAddonMap[position as keyof PositionAddonMap] in
          annotations[sideIndex] &&
        checkIfCircle(positionAddonMap[position as keyof PositionAddonMap])
      ) {
        setAnnotations({
          ...annotations,
          [sideIndex]: {
            ...annotations[sideIndex],
            [position]: {
              title: product?.title,
              id: product?.id,
              price: normalized?.price,
              shape: product?.shape,
              variantId: normalized?.id,
              side: side,
              options: variantData?.data[0]?.variants,
              images: normalized.imagesAll,
              size: product?.size,
              type: product?.type,
            },
          },
        });

        console.log(annotations, "anno");
      } else if (
        (!(position in positionAddonMap) && product.shape === "circle") ||
        product.shape === "dot"
      ) {
        setAnnotations({
          ...annotations,
          [sideIndex]: {
            ...annotations[sideIndex],
            [position]: {
              title: product?.title,
              id: product?.id,
              price: normalized?.price,
              shape: product?.shape,
              variantId: normalized?.id,
              side: side,
              options: variantData?.data[0]?.variants,
              images: normalized.imagesAll,
              size: product?.size,
              type: product?.type,
            },
          },
        });
      } else {
        setShowDetails(false);
      }
    }
  }

  // useMemo(() => {
  //   if (annotations && Object.keys(annotations[sideIndex]).length && ifAddOn) {
  //     const activeImages = Object.entries(annotations[sideIndex])
  //       .map(([key, value]) => {
  //         if (value?.shape === "circle") {
  //           return key;
  //         }
  //       })
  //       .filter((x) => x);

  //     setDropppableAreaAddOn((prev) => {
  //       return {
  //         ...prev,
  //         [side]: prev[side]?.map((pt) => {
  //           if (activeImages?.includes(pt?.id?.replace("1", ""))) {
  //             return {
  //               ...pt,
  //               disabled: false,
  //             };
  //           } else {
  //             return {
  //               ...pt,
  //               disabled: true,
  //             };
  //           }
  //         }),
  //       };
  //     });
  //   }
  // }, [annotations, side, sideIndex,ifAddOn]);

  const handleDragMove = (event: DragMoveEvent) => {
    // Access the position of the dragged item from the event
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      active: { id },
      delta,
    } = event;
    console.log(id);
    // translation.x and translation.y represent the item's position
    if (delta.x > 10 || delta.x < -10) {
      setDragDataY(1);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  function handleDragStart(event: DragStartEvent) {
    setIsDragging(event.active.id.toString());
    const data = products.find((p) => p.id == event.active.id);
    setRingType(data?.shape || '')
   
    // if (data?.shape === "circle") {
    //   setDroppableAreaCircle((prev) => ({
    //     ...prev,
    //     [side]: prev[side].map((x) => ({
    //       ...x,
    //       disabled: false,
    //     })),
    //   }));
    // }
    // else {
    //   setDroppableAreaCircle((prev) => ({
    //     ...prev,
    //     [side]: prev[side].map((x) => ({
    //       ...x,
    //       disabled: true,
    //     })),
    //   }));
    // }

    // if(data?.shape === "dot" ){
    //   setDroppableAreaDot((prev) => ({
    //     ...prev,
    //     [side]: prev[side].map((x) => ({
    //       ...x,
    //       disabled: false,
    //     })),
    //   }))
    // }
    // else {
    //   setDroppableAreaDot((prev) => ({
    //     ...prev,
    //     [side]: prev[side].map((x) => ({
    //       ...x,
    //       disabled: true,
    //     })),
    //   }))
    // }

    // if (data?.shape === "addon") {
    //   setIfAddOn(true);
    // } else {
    //   setIfAddOn(false);
    // }
  }

  function handleDragEnd(event: DragEndEvent) {
    setIsDragging("");
    setRingType('')
    setDragDataY(1);
    const {
      over,
      active: { id },
    } = event;

    if (over && over.id) {
      if (
        [
          "A",
          "B",
          "C",
          "D",
          "E",
          "F",
          "A1",
          "B1",
          "C1",
          "D1",
          "E1",
          "F1",
          "DotB",
          "DotC",
          "DotD",
          "DotE",
          "DotF",
        ].includes(id.toString())
      ) {
        if (annotations[sideIndex][over.id]) {
          setShowDetails(true);
          setProduct({
            id: annotations[sideIndex][id].id,
            position: over.id as Position,
            dotPosition: over.id as dotPosition,
          });
        }

        setCurrentPoint(id);
      } else {
        const data = products.find((p) => p.id == id);

        if (data) {
          addProducts(over.id, data);
        }
      }
    }
  }

  function remove() {
    setShowDetails(false);
    if (currentPoint) {
      setAnnotations({
        ...annotations,
        [sideIndex]: {
          ...annotations[sideIndex],
          [currentPoint as string]: undefined,
        },
      });
      setCurrentPoint(undefined);
    }
  }

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      delay: 0,
      tolerance: 5,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 0,
      tolerance: 5,
    },
  });

  // const clipPathLookup = {
  //   left: {
  //     A: "polygon(147% 2px, 74.98% 28.55%, 43.91% 32.77%, 76.37% 105.29%, 50% 99%, 8% 76%, 9% 74%, 7% 62%, 4px 46%, 13px 0px)",
  //     B: "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)",
  //     C: "polygon(75% 31%, 63% 36%, 74% 34%, 100% 57%, 100% 100%, 42% 100%, 65% 55%, 0% 36%, 54% 7%, 29% 1%)",
  //     D: "polygon(57% 8%, 80% 12%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 3% 58%, 50% 67%)",
  //     E: "polygon(40% 54%, 51.17% 36px, 42% 17px, 122% 41%, 37% 82%, 20% 71%, 6px 86%, 20% 59%)",
  //     F: "polygon(40% 0%, 46.18% -9.68%, 49% 43%, 81% 65%, 93% 91%, 43% 100%, 27% 85%, 15% 74%, 10% 23%, 34% 7%)",
  //     A1: "polygon(45% 0, 68% 0, 100% 35%, 100% 70%, 80% 90%, 51% 100%, 21% 93%, 0% 70%, 20% 0, 66% 29%)",
  //     B1: "polygon(41.33% -11px, 48.29% 27.65%, 72.19% -29.61%, 100% 31%, 100% 98%, 50% 100%, 3% 100%, 0px 67%, 0px 49%, 22% 17%)",
  //     C1: "polygon(51.51% 12.65%, 57.85% -14.56%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 30.88% 2.91%)",
  //     D1: "polygon(47.16% 20.3%, 62.39% -9px, 100% 35%, 100% 70%, 80% 90%, 51% 100%, 21% 93%, 0% 70%, 20.59% 2px, 29.34% -1px)",
  //     E1: "polygon(46.23% 23.22%, 45.73% -55.40%, 93.34% -17.57%, 93% 100%, 0% 95%, 23% 24.13%, -23.9% 9.17%)",
  //     F1: "polygon(54.85% -43.87%, 95.43% 71.7%, 67.41% 114.3%, 42.39% 119.7%, -2.47% 76.09%, 31.48% -8.14%, 47.29% 33.12%)",
  //   },
  //   right: {
  //     A: "polygon(30% 0%, 88% 6%, 89% 31%, 37% 27%, 61% 93%, 32% 100%, 0% 70%, 0 0)",
  //     B: "polygon(36% 0%, 92% 0px, 110% 90%, 28% 90%, 36% 90%, 55% 33%, 25% 7%)",
  //     C: "polygon(47% 21%, 79% 21%, 75% 42%, 100% 47%, 91% 79%, 52% 70%, 63% 54%, 10% 41%, -23% 43%, 33% 0%)",
  //     D: "polygon(57% 8%, 80% 12%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 3% 58%, 50% 67%)",
  //     E: "polygon(40% 54%, 58% 37px, 42% 17px, 122% 41%, 37% 83%, 20% 71%, 6px 86%, 20% 59%)",
  //     F: "polygon(40% 0%, 48% 0%, 49% 43%, 81% 65%, 93% 91%, 43% 100%, 27% 85%, 15% 74%, 10% 23%, 34% 7%)",
  //     A1: "polygon(47.33% 32.91%, 47.99% -75.77%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 26.67% -36.52%)",
  //     B1: "polygon(48.34% 10px, 99.67% -10px, 100% 35%, 100% 70%, 80% 90%, 51% 100%, 21% 93%, 0% 70%, 5% 10px, 37.67% -18.82%)",
  //     C1: "polygon(39.67% 40.39%, 56.99% -41.31%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 36.33% -12.91%)",
  //     D1: "polygon(33% 0, 37% 14%, 65% 0, 90% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
  //     E1: "polygon(47.67% 22.17%, 61.66% -24px, 100% 60%, 75% 100%, 25% 100%, 0% 60%, -12.67% -5.52%)",
  //     F1: "polygon(46.67% 27.35%, 75.00% -107.70%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 12% -107.74%)",
  //   },
  // };

  // const getEarringStyleByType = (earringType, size, pos) => {
  //   let transform = "translate3d(-23px, -4px, 0px)";
  //   let width = "30px";
  //   let polygone =
  //     "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";
  //   if (sideIndex === "left") {
  //     switch (pos) {
  //       case "D":
  //         switch (earringType) {
  //           case "KNIFE_EDGED":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-23px, 0px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-22px, 12px, 0px)"
  //                 : "translate3d(-16px, 5px, 0px)";
  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             break;
  //           case "MODERN_COLOUR":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-23px, 12px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-22px, 24px, 0px)"
  //                 : "translate3d(-0px, 1622px, 0px)";

  //             width =
  //               size === "large" ? "34px" : size === "small" ? "22px" : "28px";
  //             break;
  //           case "BRUSHED":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-20px, -3px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-13px, 16px, 0px)"
  //                 : "translate3d(-14px, 8px, 0px)";

  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             break;
  //           case "SIMPLE_HOOP":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-20px, 6px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-13px, 21px, 0px)"
  //                 : "translate3d(-14px, 11px, 0px)";

  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             break;
  //           default:
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-16px, 8px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-13px, 16px, 0px)"
  //                 : "translate3d(-16px, 12px, 0px)";

  //             width =
  //               size === "large" ? "34px" : size === "small" ? "22px" : "28px";
  //             break;
  //         }
  //         break;
  //       case "A":
  //         switch (earringType) {
  //           case "KNIFE_EDGED":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-23px, 0px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-22px, 12px, 0px)"
  //                 : "translate3d(5px, -13px, 0px)";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : size === "small"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 77.37% 95.29%, 101% 104%, 21% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "40px";
  //             break;
  //           case "MODERN_COLOUR":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-23px, 12px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-22px, 24px, 0px)"
  //                 : "translate3d(-4px, -12px, 0px)";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : size === "small"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 77.37% 95.29%, 101% 104%, 21% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

  //             width =
  //               size === "large" ? "34px" : size === "small" ? "22px" : "46px";
  //             break;
  //           case "BRUSHED":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(0px, -17px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-13px, 16px, 0px)"
  //                 : "translate3d(-3px, -17px, 0px)";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : size === "small"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 77.37% 95.29%, 101% 104%, 21% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

  //             width =
  //               size === "large" ? "50px" : size === "small" ? "22px" : "48px";
  //             break;
  //           case "SIMPLE_HOOP":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(0px, -14px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-4px, -13px, 0px)"
  //                 : " translate3d(-3px, -24px, 0px)";

  //             polygone =
  //               size === "large"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : size === "small"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 70.37% 63.29%, 221% 77%, 13% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

  //             width =
  //               size === "large" ? "45px" : size === "small" ? "45px" : "50px";
  //             break;
  //           default:
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-11px, -16.5px, 6px) rotate(-6deg)"
  //                 : size === "small"
  //                 ? "rotate(322deg)"
  //                 : " translate3d(-11px, -16.5px, 6px) rotate(-6deg)";

  //             width =
  //               size === "large" ? "45px" : size === "small" ? "45px" : "45px";
  //             // polygone =
  //             //   size === "large"
  //             //     ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
  //             //     : size === "small"
  //             //     ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
  //             //     : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 71.37% 91.29%, 115% 100%, 14% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";
  //             break;
  //         }
  //         break;
  //       case "B":
  //         switch (earringType) {
  //           case "KNIFE_EDGED":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-23px, 0px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-22px, 12px, 0px)"
  //                 : "translate3d(-16px, 5px, 0px)";
  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : size === "small"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 77.37% 95.29%, 101% 104%, 21% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

  //             break;
  //           case "MODERN_COLOUR":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-23px, 12px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-22px, 24px, 0px)"
  //                 : "translate3d(-16px, 22px, 0px)";

  //             width =
  //               size === "large" ? "34px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : size === "small"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 77.37% 95.29%, 101% 104%, 21% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

  //             break;
  //           case "BRUSHED":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-20px, -3px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-13px, 16px, 0px)"
  //                 : "translate3d(-14px, 8px, 0px)";

  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : size === "small"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

  //             break;
  //           case "SIMPLE_HOOP":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-20px, 6px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-13px, 21px, 0px)"
  //                 : "translate3d(-14px, 11px, 0px)";

  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : size === "small"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

  //             break;
  //           default:
  //             transform =
  //               size === "large"
  //                 ? "translate(26px, -7px) rotate(71deg)"
  //                 : size === "small"
  //                 ? "translate(26px, -10px) rotate(71deg)"
  //                 : "translate(26px, -8px) rotate(71deg)";

  //             width =
  //               size === "large" ? "36px" : size === "small" ? "30px" : "34px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : size === "small"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

  //             break;
  //         }
  //         break;
  //       case "C":
  //         switch (earringType) {
  //           case "KNIFE_EDGED":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-23px, 0px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-22px, 12px, 0px)"
  //                 : "translate3d(-16px, 5px, 0px)";
  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : size === "small"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 77.37% 95.29%, 101% 104%, 21% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

  //             break;
  //           case "MODERN_COLOUR":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-23px, 12px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-22px, 24px, 0px)"
  //                 : "translate3d(-16px, 22px, 0px)";

  //             width =
  //               size === "large" ? "34px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : size === "small"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 77.37% 95.29%, 101% 104%, 21% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

  //             break;
  //           case "BRUSHED":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-20px, -3px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-13px, 16px, 0px)"
  //                 : "translate3d(-14px, 8px, 0px)";

  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : size === "small"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

  //             break;
  //           case "SIMPLE_HOOP":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-20px, 6px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-13px, 21px, 0px)"
  //                 : "translate3d(-14px, 11px, 0px)";

  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : size === "small"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

  //             break;
  //           default:
  //             transform =
  //               size === "large"
  //                 ? "translate3d(17px, 5px, 0px) rotate(126deg)"
  //                 : size === "small"
  //                 ? "translate3d(21px, 5px, 0px) rotate(126deg)"
  //                 : "translate3d(21px, 3px, 0px) rotate(126deg)";

  //             width =
  //               size === "large" ? "36px" : size === "small" ? "32px" : "34px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : size === "small"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

  //             break;
  //         }
  //         break;
  //       case "E":
  //         switch (earringType) {
  //           case "KNIFE_EDGED":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-23px, 0px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-22px, 12px, 0px)"
  //                 : "translate3d(-16px, 5px, 0px)";
  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : size === "small"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 77.37% 95.29%, 101% 104%, 21% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

  //             break;
  //           case "MODERN_COLOUR":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-23px, 12px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-22px, 24px, 0px)"
  //                 : "translate3d(-16px, 22px, 0px)";

  //             width =
  //               size === "large" ? "34px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : size === "small"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 77.37% 95.29%, 101% 104%, 21% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

  //             break;
  //           case "BRUSHED":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-20px, -3px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-13px, 16px, 0px)"
  //                 : "translate3d(-14px, 8px, 0px)";

  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : size === "small"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

  //             break;
  //           case "SIMPLE_HOOP":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-20px, 6px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-13px, 21px, 0px)"
  //                 : "translate3d(-14px, 11px, 0px)";

  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : size === "small"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

  //             break;
  //           default:
  //             transform =
  //               size === "large"
  //                 ? "translate3d(17px, 30px, 0px) rotate(-33deg)"
  //                 : size === "small"
  //                 ? "translate3d(12px, 40px, 0px) rotate(-19deg)"
  //                 : "translate3d(12px, 40px, 0px) rotate(-19deg)";

  //             width =
  //               size === "large" ? "22px" : size === "small" ? "18px" : "20px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : size === "small"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

  //             break;
  //         }
  //         break;
  //       case "F":
  //         switch (earringType) {
  //           case "KNIFE_EDGED":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-23px, 0px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-22px, 12px, 0px)"
  //                 : "translate3d(-16px, 5px, 0px)";
  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : size === "small"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 77.37% 95.29%, 101% 104%, 21% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

  //             break;
  //           case "MODERN_COLOUR":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-23px, 12px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-22px, 24px, 0px)"
  //                 : "translate3d(-16px, 22px, 0px)";

  //             width =
  //               size === "large" ? "34px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : size === "small"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 77.37% 95.29%, 101% 104%, 21% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

  //             break;
  //           case "BRUSHED":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-20px, -3px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-13px, 16px, 0px)"
  //                 : "translate3d(-14px, 8px, 0px)";

  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : size === "small"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

  //             break;
  //           case "SIMPLE_HOOP":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-20px, 6px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-13px, 21px, 0px)"
  //                 : "translate3d(-14px, 11px, 0px)";

  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : size === "small"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

  //             break;
  //           default:
  //             transform =
  //               size === "large"
  //                 ? "translate(-4px, 7px)"
  //                 : size === "small"
  //                 ? "translate(-4px, 7px)"
  //                 : "translate(-4px, 7px)";

  //             width =
  //               size === "large" ? "24px" : size === "small" ? "20px" : "22px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : size === "small"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

  //             break;
  //         }
  //         break;
  //       default:
  //     }
  //   } else if (sideIndex === "right") {
  //     switch (pos) {
  //       case "D":
  //         switch (earringType) {
  //           case "KNIFE_EDGED":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-23px, 0px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-22px, 12px, 0px)"
  //                 : "translate3d(-16px, 5px, 0px)";
  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             break;
  //           case "MODERN_COLOUR":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-23px, 12px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-22px, 24px, 0px)"
  //                 : "translate3d(-16px, 22px, 0px)";

  //             width =
  //               size === "large" ? "34px" : size === "small" ? "22px" : "28px";
  //             break;
  //           case "BRUSHED":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-20px, -3px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-13px, 16px, 0px)"
  //                 : "translate3d(-14px, 8px, 0px)";

  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             break;
  //           case "SIMPLE_HOOP":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-20px, 6px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-13px, 21px, 0px)"
  //                 : "translate3d(-14px, 11px, 0px)";

  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             break;
  //           default:
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-16px, 8px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-13px, 16px, 0px)"
  //                 : "translate3d(-16px, 12px, 0px)";

  //             width =
  //               size === "large" ? "34px" : size === "small" ? "22px" : "28px";
  //             break;
  //         }
  //         break;
  //       case "A":
  //         switch (earringType) {
  //           case "KNIFE_EDGED":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-23px, 0px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-22px, 12px, 0px)"
  //                 : "translate3d(5px, -13px, 0px)";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : size === "small"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 77.37% 95.29%, 101% 104%, 21% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "40px";
  //             break;
  //           case "MODERN_COLOUR":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-23px, 12px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-22px, 24px, 0px)"
  //                 : "translate3d(-4px, -12px, 0px)";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : size === "small"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 77.37% 95.29%, 101% 104%, 21% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

  //             width =
  //               size === "large" ? "34px" : size === "small" ? "22px" : "46px";
  //             break;
  //           case "BRUSHED":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(0px, -17px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-13px, 16px, 0px)"
  //                 : "translate3d(-3px, -17px, 0px)";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : size === "small"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 77.37% 95.29%, 101% 104%, 21% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

  //             width =
  //               size === "large" ? "50px" : size === "small" ? "22px" : "48px";
  //             break;
  //           case "SIMPLE_HOOP":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(0px, -14px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-4px, -13px, 0px)"
  //                 : " translate3d(-3px, -24px, 0px)";

  //             polygone =
  //               size === "large"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : size === "small"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 70.37% 63.29%, 221% 77%, 13% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

  //             width =
  //               size === "large" ? "45px" : size === "small" ? "45px" : "50px";
  //             break;
  //           default:
  //             transform =
  //               size === "large"
  //                 ? "translate3d(0px, -14px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-4px, -13px, 0px)"
  //                 : " translate3d(-3px, -17px, 0px)";

  //             width =
  //               size === "large" ? "45px" : size === "small" ? "45px" : "50px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : size === "small"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 71.37% 91.29%, 115% 100%, 14% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";
  //             break;
  //         }
  //         break;
  //       case "B":
  //         switch (earringType) {
  //           case "KNIFE_EDGED":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-23px, 0px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-22px, 12px, 0px)"
  //                 : "translate3d(-16px, 5px, 0px)";
  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : size === "small"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 77.37% 95.29%, 101% 104%, 21% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

  //             break;
  //           case "MODERN_COLOUR":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-23px, 12px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-22px, 24px, 0px)"
  //                 : "translate3d(-16px, 22px, 0px)";

  //             width =
  //               size === "large" ? "34px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : size === "small"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 77.37% 95.29%, 101% 104%, 21% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

  //             break;
  //           case "BRUSHED":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-20px, -3px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-13px, 16px, 0px)"
  //                 : "translate3d(-14px, 8px, 0px)";

  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : size === "small"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

  //             break;
  //           case "SIMPLE_HOOP":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-20px, 6px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-13px, 21px, 0px)"
  //                 : "translate3d(-14px, 11px, 0px)";

  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : size === "small"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

  //             break;
  //           default:
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-16px, 8px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(0px, -30px, 0px)"
  //                 : "translate3d(-16px, 12px, 0px)";

  //             width =
  //               size === "large" ? "34px" : size === "small" ? "45px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : size === "small"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

  //             break;
  //         }
  //         break;
  //       case "C":
  //         switch (earringType) {
  //           case "KNIFE_EDGED":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-23px, 0px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-22px, 12px, 0px)"
  //                 : "translate3d(-16px, 5px, 0px)";
  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : size === "small"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 77.37% 95.29%, 101% 104%, 21% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

  //             break;
  //           case "MODERN_COLOUR":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-23px, 12px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-22px, 24px, 0px)"
  //                 : "translate3d(-16px, 22px, 0px)";

  //             width =
  //               size === "large" ? "34px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : size === "small"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 77.37% 95.29%, 101% 104%, 21% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

  //             break;
  //           case "BRUSHED":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-20px, -3px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-13px, 16px, 0px)"
  //                 : "translate3d(-14px, 8px, 0px)";

  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : size === "small"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

  //             break;
  //           case "SIMPLE_HOOP":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-20px, 6px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-13px, 21px, 0px)"
  //                 : "translate3d(-14px, 11px, 0px)";

  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : size === "small"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

  //             break;
  //           default:
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-16px, 8px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(0px, -30px, 0px)"
  //                 : "translate3d(-16px, 12px, 0px)";

  //             width =
  //               size === "large" ? "34px" : size === "small" ? "45px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : size === "small"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

  //             break;
  //         }
  //         break;
  //       case "E":
  //         switch (earringType) {
  //           case "KNIFE_EDGED":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-23px, 0px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-22px, 12px, 0px)"
  //                 : "translate3d(-16px, 5px, 0px)";
  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : size === "small"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 77.37% 95.29%, 101% 104%, 21% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

  //             break;
  //           case "MODERN_COLOUR":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-23px, 12px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-22px, 24px, 0px)"
  //                 : "translate3d(-16px, 22px, 0px)";

  //             width =
  //               size === "large" ? "34px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : size === "small"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 77.37% 95.29%, 101% 104%, 21% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

  //             break;
  //           case "BRUSHED":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-20px, -3px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-13px, 16px, 0px)"
  //                 : "translate3d(-14px, 8px, 0px)";

  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : size === "small"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

  //             break;
  //           case "SIMPLE_HOOP":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-20px, 6px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-13px, 21px, 0px)"
  //                 : "translate3d(-14px, 11px, 0px)";

  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : size === "small"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

  //             break;
  //           default:
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-16px, 8px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(0px, -30px, 0px)"
  //                 : "translate3d(-16px, 12px, 0px)";

  //             width =
  //               size === "large" ? "34px" : size === "small" ? "45px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : size === "small"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

  //             break;
  //         }
  //         break;
  //       case "F":
  //         switch (earringType) {
  //           case "KNIFE_EDGED":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-23px, 0px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-22px, 12px, 0px)"
  //                 : "translate3d(-16px, 5px, 0px)";
  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : size === "small"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 77.37% 95.29%, 101% 104%, 21% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

  //             break;
  //           case "MODERN_COLOUR":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-23px, 12px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-22px, 24px, 0px)"
  //                 : "translate3d(-16px, 22px, 0px)";

  //             width =
  //               size === "large" ? "34px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : size === "small"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 77.37% 95.29%, 101% 104%, 21% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

  //             break;
  //           case "BRUSHED":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-20px, -3px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-13px, 16px, 0px)"
  //                 : "translate3d(-14px, 8px, 0px)";

  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
  //                 : size === "small"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

  //             break;
  //           case "SIMPLE_HOOP":
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-20px, 6px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(-13px, 21px, 0px)"
  //                 : "translate3d(-14px, 11px, 0px)";

  //             width =
  //               size === "large" ? "32px" : size === "small" ? "22px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : size === "small"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

  //             break;
  //           default:
  //             transform =
  //               size === "large"
  //                 ? "translate3d(-16px, 8px, 0px)"
  //                 : size === "small"
  //                 ? "translate3d(0px, -30px, 0px)"
  //                 : "translate3d(-16px, 12px, 0px)";

  //             width =
  //               size === "large" ? "34px" : size === "small" ? "45px" : "28px";
  //             polygone =
  //               size === "large"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : size === "small"
  //                 ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
  //                 : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

  //             break;
  //         }
  //         break;
  //       default:
  //     }
  //   }

  //   return {
  //     transform,
  //     width,
  //     polygone,
  //   };
  // };

  // const getStyle = (prod, pos) => {
  //   let style = {};

  //   const s = getEarringStyleByType(prod?.type, prod?.size, pos);

  //   if (sideIndex === "left") {
  //     switch (pos) {
  //       case "A":
  //         style = {
  //           width: s?.width,
  //           transform: s?.transform,
  //         };
  //         break;
  //       case "B":
  //         style = {
  //           width: s?.width,
  //           transform: s?.transform,
  //         };
  //         break;
  //       case "C":
  //         style = {
  //           width: s?.width,
  //           transform: s?.transform,
  //         };
  //         break;
  //       case "D":
  //         style = {
  //           clipPath:
  //             "polygon(57% 8%, 80% 12%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 3% 58%, 50% 67%)",
  //           width: s?.width,
  //           transform: s?.transform,
  //         };
  //         break;
  //       case "E":
  //         style = {
  //           width: s?.width,
  //           transform: s?.transform,
  //         };
  //         break;
  //       case "F":
  //         style = {
  //           width: s?.width,
  //           transform: s?.transform,
  //         };
  //         break;
  //     }
  //   }

  //   if (sideIndex === "right") {
  //     switch (pos) {
  //       case "A":
  //         style = {
  //           clipPath: s?.polygone,
  //           width: s?.width,
  //           transform: s?.transform,
  //         };
  //         break;
  //       case "B":
  //         style = {
  //           clipPath: s?.polygone,
  //           width: s?.width,
  //           transform: s?.transform,
  //         };
  //         break;
  //       case "C":
  //         style = {
  //           clipPath: s?.polygone,
  //           width: s?.width,
  //           transform: s?.transform,
  //         };
  //         break;
  //       case "D":
  //         style = {
  //           clipPath:
  //             "polygon(57% 8%, 80% 12%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 3% 58%, 50% 67%)",
  //           width: "30px",
  //           transform: getTransform(prod?.type),
  //         };
  //         break;
  //       case "E":
  //         style = {
  //           clipPath: s?.polygone,
  //           width: s?.width,
  //           transform: s?.transform,
  //         };
  //         break;
  //       case "F":
  //         style = {
  //           clipPath: s?.polygone,
  //           width: s?.width,
  //           transform: s?.transform,
  //         };
  //         break;
  //     }
  //   }

  //   return style;
  // };
  const keyboardSensor = useSensor(KeyboardSensor, {});
  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getEarringStyleByType = (
    earringType: unknown,
    size: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pos: any
  ) => {
    let transform = "translate3d(-23px, -4px, 0px)";
    let width = "30px";
    // let backgroundImage = `url('https://tashstudio.mariatash.com/images/Circle.png?b31568f721d14573d5ab6797227dfda8')`;
    // let backgroundSize = "cover";
    console.log(earringType, "type");
    switch (pos) {
      case "D":
        switch (earringType) {
          case "CRAWLER":
            transform =
              size === "large"
                ? "translate(7px, 47px) rotate(30deg)"
                : size === "small"
                ? "translate(7px, 47px) rotate(30deg)"
                : "translate(7px, 47px) rotate(30deg)";
            width =
              size === "large" ? "29px" : size === "small" ? "27px" : "28px";

            break;

          case "CLUSTER":
            transform =
              size === "large"
                ? "translate(11px, 5px) rotate(0deg)"
                : size === "small"
                ? "translate(11px, 5px) rotate(0deg)"
                : "translate(11px, 5px) rotate(0deg)";
            width =
              size === "large" ? "30px" : size === "small" ? "32px" : "33px";
            break;
          case "STUD":
            transform =
              size === "large"
                ? "translate3d(18px, 23px, 0px) rotate(19deg)"
                : size === "small"
                ? "translate3d(18px, 23px, 0px) rotate(19deg)"
                : "translate3d(18px, 23px, 0px) rotate(19deg)";
            width =
              size === "large" ? "30px" : size === "small" ? "25px" : "27px";
            break;
          case "KNIFE_EDGED":
            transform =
              size === "large"
                ? "translate3d(16px, 28px, 0px) rotate(-1deg)"
                : size === "small"
                ? "translate3d(16px, 28px, 0px) rotate(-1deg)"
                : "translate3d(16px, 28px, 0px) rotate(-1deg)";
            width =
              size === "large" ? "27px" : size === "small" ? "27px" : "27px";
            break;
          case "MODERN_COLOUR":
            transform =
              size === "large"
                ? "translate3d(11px, 26px, 0px)"
                : size === "small"
                ? "translate3d(11px, 26px, 0px)"
                : "translate3d(13px, 34px, 0px)";

            width =
              size === "large" ? "34px" : size === "small" ? "22px" : "28px";
            break;
          case "BRUSHED":
            transform =
              size === "large"
                ? "translate3d(14px, 32px, 0px)"
                : size === "small"
                ? "translate3d(14px, 17px, 0px)"
                : "translate3d(20px, 28px, 0px)";

            width =
              size === "large" ? "24px" : size === "small" ? "22px" : "22px";
            break;
          case "SIMPLE_HOOP":
            transform =
              size === "large"
                ? "translate3d(13px, 15px, 0px)"
                : size === "small"
                ? "translate3d(13px, 15px, 0px)"
                : "translate3d(24px, 30px, 0px)";

            width =
              size === "large" ? "28px" : size === "small" ? "22px" : "25px";
            break;
          case "TWISTED_GOLD":
            transform =
              size === "large"
                ? "translate3d(16px, 27px, 0px)"
                : size === "small"
                ? "translate3d(16px, 22px, 0px)"
                : "translate3d(16px, 22px, 0px)";

            width =
              size === "large" ? "27px" : size === "small" ? "22px" : "28px";
            break;
          default:
            transform =
              size === "large"
                ? "translate3d(16px, 24px, 0px)"
                : size === "small"
                ? "translate3d(19px, 12px, 0px)"
                : "translate3d(10px, 33px, 0px)";

            width =
              size === "large" ? "30px" : size === "small" ? "20px" : "26px";

            break;
        }
        break;
      case "DotD":
        switch (earringType) {
          case "CRAWLER":
            transform =
              size === "large"
                ? "translate(7px, 47px) rotate(30deg)"
                : size === "small"
                ? "translate(7px, 47px) rotate(30deg)"
                : "translate(7px, 47px) rotate(30deg)";
            width =
              size === "large" ? "29px" : size === "small" ? "27px" : "28px";

            break;

          case "CLUSTER":
            transform =
              size === "large"
                ? "translate(11px, 5px) rotate(0deg)"
                : size === "small"
                ? "translate(11px, 5px) rotate(0deg)"
                : "translate(11px, 5px) rotate(0deg)";
            width =
              size === "large" ? "30px" : size === "small" ? "32px" : "33px";
            break;
          case "STUD":
            transform =
              size === "large"
                ? "translate3d(18px, 23px, 0px) rotate(19deg)"
                : size === "small"
                ? "translate3d(18px, 23px, 0px) rotate(19deg)"
                : "translate3d(18px, 23px, 0px) rotate(19deg)";
            width =
              size === "large" ? "30px" : size === "small" ? "25px" : "27px";
            break;
          case "KNIFE_EDGED":
            transform =
              size === "large"
                ? "translate3d(-23px, 0px, 0px)"
                : size === "small"
                ? "translate3d(-22px, 12px, 0px)"
                : "translate3d(-16px, 5px, 0px)";
            width =
              size === "large" ? "32px" : size === "small" ? "22px" : "28px";
            break;
          case "MODERN_COLOUR":
            transform =
              size === "large"
                ? "translate3d(-23px, 12px, 0px)"
                : size === "small"
                ? "translate3d(-22px, 24px, 0px)"
                : "translate3d(-16px, 22px, 0px)";

            width =
              size === "large" ? "34px" : size === "small" ? "22px" : "28px";
            break;
          case "BRUSHED":
            transform =
              size === "large"
                ? "translate3d(-20px, -3px, 0px)"
                : size === "small"
                ? "translate3d(-13px, 16px, 0px)"
                : "translate3d(-14px, 8px, 0px)";

            width =
              size === "large" ? "32px" : size === "small" ? "22px" : "28px";
            break;
          case "SIMPLE_HOOP":
            transform =
              size === "large"
                ? "translate3d(-20px, 6px, 0px)"
                : size === "small"
                ? "translate3d(-13px, 21px, 0px)"
                : "translate3d(-14px, 11px, 0px)";

            width =
              size === "large" ? "32px" : size === "small" ? "22px" : "28px";
            break;
          case "TWISTED_GOLD":
            transform =
              size === "large"
                ? "translate3d(-16px, 3px, 0px)"
                : size === "small"
                ? "translate3d(-13px, 21px, 0px)"
                : "translate3d(-14px, 11px, 0px)";

            width =
              size === "large" ? "32px" : size === "small" ? "22px" : "28px";
            break;
          default:
            transform =
              size === "large"
                ? "translate3d(-16px, 8px, 0px)"
                : size === "small"
                ? "translate3d(-13px, 16px, 0px)"
                : "translate3d(-16px, 12px, 0px)";

            width =
              size === "large" ? "32px" : size === "small" ? "22px" : "28px";

            break;
        }
        break;
      case "A":
        switch (earringType) {
          case "CRAWLER":
            transform =
              size === "large"
                ? "translate(-65px, 44px) rotate(64deg)"
                : size === "small"
                ? "translate(57px, 44px) rotate(14deg)"
                : "translate(-65px, 44px) rotate(64deg)";
            width =
              size === "large" ? "50px" : size === "small" ? "30px" : "40px";
            break;
          case "KNIFE_EDGED":
            transform =
              size === "large"
                ? "translate3d(1px, 5px, 0px)"
                : size === "small"
                ? "translate3d(1px, 5px, 0px)"
                : "translate3d(1px, 5px, 0px)";
            width =
              size === "large" ? "41px" : size === "small" ? "41px" : "41px";
            break;
          case "MODERN_COLOUR":
            transform =
              size === "large"
                ? "translate3d(6px, 2px, 0px)"
                : size === "small"
                ? "translate3d(6px, 2px, 0px)"
                : "translate3d(6px, 2px, 0px)";

            width =
              size === "large" ? "38px" : size === "small" ? "40px" : "43px";
            break;
          case "BRUSHED":
            transform =
              size === "large"
                ? "translate3d(6px, -9px, 0px) rotate(4deg)"
                : size === "small"
                ? "translate3d(6px, 7px, 0px) rotate(4deg)"
                : "translate3d(6px, 7px, 0px) rotate(4deg)";

            width =
              size === "large" ? "36px" : size === "small" ? "38px" : "40px";
            break;
          case "SIMPLE_HOOP":
            transform =
              size === "large"
                ? "translate3d(4px, 8px, 0px) rotate(1deg)"
                : size === "small"
                ? "translate3d(4px, 8px, 0px) rotate(1deg)"
                : "translate3d(4px, 8px, 0px) rotate(1deg)";

            width =
              size === "large" ? "40px" : size === "small" ? "35px" : "37px";
            break;
          case "STUD":
            transform =
              size === "large"
                ? "translate(-20%, 30%) rotate(0deg)"
                : size === "small"
                ? "translate3d(63px, 38px, 0px)"
                : "translate(-20%, 30%) rotate(0deg)";
            width =
              size === "large" ? "35px" : size === "small" ? "22px" : "32px";
            break;
          case "CLUSTER":
            transform =
              size === "large"
                ? "translate3d(63px, 19px, 0px) rotate(67deg)"
                : size === "small"
                ? "translate3d(63px, 25px, 0px) rotate(89deg)"
                : "translate3d(63px, 25px, 0px) rotate(89deg)";
            width =
              size === "large" ? "30px" : size === "small" ? "28px" : "40px";
            break;
          case "TWISTED_GOLD":
            transform =
              size === "large"
                ? "translate3d(12px, -5px, 0px) rotate(132deg)"
                : size === "small"
                ? "translate3d(-13px, 21px, 0px)"
                : "translate3d(-14px, 11px, 0px)";

            width =
              size === "large" ? "31px" : size === "small" ? "22px" : "28px";
            break;
          default:
            transform =
              size === "large"
                ? "translate3d(10px, -2.5px, 6px) rotate(370deg)"
                : size === "small"
                ? "translate3d(10px, 6.5px, 6px) rotate(366deg)"
                : "translate3d(10px, -1.5px, 6px) rotate(374deg)";

            width =
              size === "large" ? "44px" : size === "small" ? "40px" : "41px";
            // polygone =
            //   size === "large"
            //     ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
            //     : size === "small"
            //     ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
            //     : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 71.37% 91.29%, 115% 100%, 14% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";
            break;
        }
        break;
      case "B":
        switch (earringType) {
          case "CRAWLER":
            transform =
              size === "large"
                ? "translate(15px, 13px) rotate(104deg)"
                : size === "small"
                ? "translate(15px, 13px) rotate(104deg)"
                : "translate(15px, 13px) rotate(104deg)";
            width =
              size === "large" ? "29px" : size === "small" ? "27px" : "28px";
            break;
          case "KNIFE_EDGED":
            transform =
              size === "large"
                ? "translate3d(-23px, 0px, 0px)"
                : size === "small"
                ? "translate3d(-22px, 12px, 0px)"
                : "translate3d(20px, 39px, 0px) rotate(-7deg)";
            width =
              size === "large" ? "64px" : size === "small" ? "62px" : "63px";
            break;
          case "MODERN_COLOUR":
            transform =
              size === "large"
                ? "translate3d(10px, 2px, 0px) rotate(-7deg)"
                : size === "small"
                ? "translate3d(10px, 2px, 0px) rotate(-7deg)"
                : "translate3d(10px, 2px, 0px) rotate(-7deg)";

            width =
              size === "large" ? "34px" : size === "small" ? "34px" : "38px";
            break;
          case "BRUSHED":
            transform =
              size === "large"
                ? "translate3d(11px, 28px, 0px) rotate(-5deg)"
                : size === "small"
                ? "translate3d(18px, 9px, 0px) rotate(13deg)"
                : "translate3d(18px, 5px, 0px) rotate(-4deg)";

            width =
              size === "large" ? "60px" : size === "small" ? "22px" : "32px";
            break;
          case "SIMPLE_HOOP":
            transform =
              size === "large"
                ? "translate3d(10px, 33px, 0px) rotate(-9deg)"
                : size === "small"
                ? "translate3d(10px, 33px, 0px) rotate(-9deg)"
                : "translate3d(8px, 33px, 0px) rotate(-2deg)";

            width =
              size === "large" ? "46px" : size === "small" ? "48px" : "54px";
            break;
          case "STUD":
            transform =
              size === "large"
                ? "translate3d(17px, 19px, 0px) rotate(22deg)"
                : size === "small"
                ? "translate3d(17px, 19px, 0px) rotate(22deg)"
                : "translate3d(17px, 19px, 0px) rotate(22deg)";
            width =
              size === "large" ? "30px" : size === "small" ? "25px" : "27px";
            break;
          case "CLUSTER":
            transform =
              size === "large"
                ? "translate3d(15px, -3px, 0px) rotate(143deg)"
                : size === "small"
                ? "translate3d(18px, 10px, 0px) rotate(161deg)"
                : "translate3d(18px, 10px, 0px) rotate(161deg)";
            width =
              size === "large" ? "29px" : size === "small" ? "27px" : "28px";
            break;
          case "TWISTED_GOLD":
            transform =
              size === "large"
                ? "translate3d(5px, 7px, 0px)rotate(4deg)"
                : size === "small"
                ? "translate3d(5px, 7px, 0px)rotate(4deg)"
                : "translate3d(21px, 2px, 0px)";

            width =
              size === "large" ? "44px" : size === "small" ? "22px" : "28px";
            break;
          default:
            transform =
              size === "large"
                ? "translate(2px, 10px) rotate(331deg)"
                : size === "small"
                ? "translate(22px, 4px) rotate(71deg)"
                : "translate(14px, 22px) rotate(346deg)";

            width =
              size === "large" ? "56px" : size === "small" ? "25px" : "52px";
            break;
        }
        break;
      case "DotB":
        switch (earringType) {
          case "CRAWLER":
            transform =
              size === "large"
                ? "translate(15px, 13px) rotate(104deg)"
                : size === "small"
                ? "translate(15px, 13px) rotate(104deg)"
                : "translate(15px, 13px) rotate(104deg)";
            width =
              size === "large" ? "29px" : size === "small" ? "27px" : "28px";
            break;
          case "KNIFE_EDGED":
            transform =
              size === "large"
                ? "translate3d(-23px, 0px, 0px)"
                : size === "small"
                ? "translate3d(-22px, 12px, 0px)"
                : "translate3d(-16px, 5px, 0px)";
            width =
              size === "large" ? "32px" : size === "small" ? "22px" : "28px";
            break;
          case "MODERN_COLOUR":
            transform =
              size === "large"
                ? "translate3d(4px, -16px, 0px) rotate(-7deg)"
                : size === "small"
                ? "translate3d(4px, -16px, 0px) rotate(-7deg)"
                : "translate3d(4px, -16px, 0px) rotate(-7deg)";

            width =
              size === "large" ? "34px" : size === "small" ? "34px" : "38px";
            break;
          case "BRUSHED":
            transform =
              size === "large"
                ? "translate3d(34px, 9px, 0px) rotate(13deg)"
                : size === "small"
                ? "translate3d(34px, 9px, 0px) rotate(13deg)"
                : "translate3d(34px, 9px, 0px) rotate(13deg)";

            width =
              size === "large" ? "36px" : size === "small" ? "22px" : "32px";
            break;
          case "SIMPLE_HOOP":
            transform =
              size === "large"
                ? "translate3d(-20px, 6px, 0px)"
                : size === "small"
                ? "translate3d(-13px, 21px, 0px)"
                : "translate3d(-14px, 11px, 0px)";

            width =
              size === "large" ? "32px" : size === "small" ? "22px" : "28px";
            break;
          case "STUD":
            transform =
              size === "large"
                ? "translate3d(17px, 19px, 0px) rotate(22deg)"
                : size === "small"
                ? "translate3d(17px, 19px, 0px) rotate(22deg)"
                : "translate3d(17px, 19px, 0px) rotate(22deg)";
            width =
              size === "large" ? "30px" : size === "small" ? "25px" : "27px";
            break;
          case "CLUSTER":
            transform =
              size === "large"
                ? "translate3d(15px, -3px, 0px) rotate(143deg)"
                : size === "small"
                ? "translate3d(18px, 10px, 0px) rotate(161deg)"
                : "translate3d(18px, 10px, 0px) rotate(161deg)";
            width =
              size === "large" ? "29px" : size === "small" ? "27px" : "28px";
            break;
          case "TWISTED_GOLD":
            transform =
              size === "large"
                ? "translate3d(21px, 3px, 0px)"
                : size === "small"
                ? "translate3d(21px, 3px, 0px)"
                : "translate3d(21px, 2px, 0px)";

            width =
              size === "large" ? "38px" : size === "small" ? "22px" : "28px";
            break;
          default:
            transform =
              size === "large"
                ? "translate(27px, -6px) rotate(74deg)"
                : size === "small"
                ? "translate(26px, -7px) rotate(71deg)"
                : "translate(26px, -10px) rotate(71deg)";

            width =
              size === "large" ? "35px" : size === "small" ? "25px" : "30px";
            break;
        }
        break;
      case "E":
        switch (earringType) {
          case "CRAWLER":
            transform =
              size === "large"
                ? "translate(16px, 16px) rotate(52deg)"
                : size === "small"
                ? "translate(16px, 16px) rotate(52deg)"
                : "translate(16px, 16px) rotate(52deg)";
            width =
              size === "large" ? "29px" : size === "small" ? "27px" : "28px";
            break;
          case "KNIFE_EDGED":
            transform =
              size === "large"
                ? "translate3d(14px, 21px, 0px) rotate(-23deg)"
                : size === "small"
                ? "translate3d(14px, 21px, 0px) rotate(-23deg)"
                : "translate3d(14px, 21px, 0px) rotate(-23deg)";
            width =
              size === "large" ? "42px" : size === "small" ? "36px" : "40px";
            break;
          case "MODERN_COLOUR":
            transform =
              size === "large"
                ? "translate3d(9px, 24px, 0px) rotate(8deg)"
                : size === "small"
                ? "translate3d(9px, 24px, 0px) rotate(8deg)"
                : "translate3d(9px, 24px, 0px) rotate(8deg)";

            width =
              size === "large" ? "34px" : size === "small" ? "28px" : "31px";
            break;
          case "BRUSHED":
            transform =
              size === "large"
                ? "translate3d(9px, 30px, 0px)"
                : size === "small"
                ? "translate3d(12px, 30px, 0px)"
                : "translate3d(12px, 30px, 0px)";

            width =
              size === "large" ? "39px" : size === "small" ? "22px" : "32px";
            break;
          case "SIMPLE_HOOP":
            transform =
              size === "large"
                ? "translate3d(14px, 27px, 0px) rotate(-7deg)"
                : size === "small"
                ? "translate3d(14px, 27px, 0px) rotate(-7deg)"
                : "translate3d(14px, 27px, 0px) rotate(-7deg)";

            width =
              size === "large" ? "27px" : size === "small" ? "21px" : "24px";
            break;
          case "STUD":
            transform =
              size === "large"
                ? "translate3d(15px, 21px, 0px) rotate(19deg)"
                : size === "small"
                ? "translate3d(15px, 21px, 0px) rotate(19deg)"
                : "translate3d(15px, 21px, 0px) rotate(19deg)";
            width =
              size === "large" ? "30px" : size === "small" ? "25px" : "27px";
            break;
          case "CLUSTER":
            transform =
              size === "large"
                ? "translate3d(16px, 4px, 0px) rotate(202deg)"
                : size === "small"
                ? "translate3d(14px, 14px, 0px) rotate(225deg)"
                : "translate3d(14px, 14px, 0px) rotate(225deg)";
            width =
              size === "large" ? "29px" : size === "small" ? "27px" : "28px";
            break;
          case "TWISTED_GOLD":
            transform =
              size === "large"
                ? "translate3d(19px, 11px, 0px) rotate(-16deg)"
                : size === "small"
                ? "translate3d(20px, 11px, 0px) rotate(-16deg)"
                : "translate3d(20px, 11px, 0px) rotate(-16deg)";

            width =
              size === "large" ? "30px" : size === "small" ? "22px" : "28px";
            break;
          default:
            transform =
              size === "large"
                ? "translate3d(16px, 29px, 0px) rotate(-15deg)"
                : size === "small"
                ? "translate3d(16px, 29px, 0px) rotate(-19deg)"
                : "translate3d(18px, 27px, 0px) rotate(-19deg)";

            width =
              size === "large" ? "36px" : size === "small" ? "20px" : "33px";
            // polygone =
            //   size === "large"
            //     ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
            //     : size === "small"
            //     ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
            //     : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

            break;
        }
        break;
      case "DotE":
        switch (earringType) {
          case "CRAWLER":
            transform =
              size === "large"
                ? "translate(16px, 16px) rotate(52deg)"
                : size === "small"
                ? "translate(16px, 16px) rotate(52deg)"
                : "translate(16px, 16px) rotate(52deg)";
            width =
              size === "large" ? "29px" : size === "small" ? "27px" : "28px";
            break;
          case "KNIFE_EDGED":
            transform =
              size === "large"
                ? "translate3d(-23px, 0px, 0px)"
                : size === "small"
                ? "translate3d(-22px, 12px, 0px)"
                : "translate3d(-16px, 5px, 0px)";
            width =
              size === "large" ? "32px" : size === "small" ? "22px" : "28px";
            break;
          case "MODERN_COLOUR":
            transform =
              size === "large"
                ? "translate3d(-23px, 12px, 0px)"
                : size === "small"
                ? "translate3d(-22px, 24px, 0px)"
                : "translate3d(0px, 37px, 0px) rotate(8deg)";

            width =
              size === "large" ? "34px" : size === "small" ? "28px" : "31px";
            break;
          case "BRUSHED":
            transform =
              size === "large"
                ? "translate3d(1px, 42px, 0px)"
                : size === "small"
                ? "translate3d(4px, 42px, 0px)"
                : "translate3d(4px, 42px, 0px)";

            width =
              size === "large" ? "36px" : size === "small" ? "22px" : "32px";
            break;
          case "SIMPLE_HOOP":
            transform =
              size === "large"
                ? "translate3d(-20px, 6px, 0px)"
                : size === "small"
                ? "translate3d(-13px, 21px, 0px)"
                : "translate3d(-14px, 11px, 0px)";

            width =
              size === "large" ? "32px" : size === "small" ? "22px" : "28px";
            break;
          case "STUD":
            transform =
              size === "large"
                ? "translate3d(15px, 21px, 0px) rotate(19deg)"
                : size === "small"
                ? "translate3d(15px, 21px, 0px) rotate(19deg)"
                : "translate3d(15px, 21px, 0px) rotate(19deg)";
            width =
              size === "large" ? "30px" : size === "small" ? "25px" : "27px";
            break;
          case "CLUSTER":
            transform =
              size === "large"
                ? "translate3d(16px, 4px, 0px) rotate(202deg)"
                : size === "small"
                ? "translate3d(14px, 14px, 0px) rotate(225deg)"
                : "translate3d(14px, 14px, 0px) rotate(225deg)";
            width =
              size === "large" ? "29px" : size === "small" ? "27px" : "28px";
            break;
          case "TWISTED_GOLD":
            transform =
              size === "large"
                ? "translate3d(4px, 31px, 0px) rotate(-16deg)"
                : size === "small"
                ? "translate3d(-13px, 21px, 0px)"
                : "translate3d(-14px, 11px, 0px)";

            width =
              size === "large" ? "27px" : size === "small" ? "22px" : "28px";
            break;
          default:
            transform =
              size === "large"
                ? "translate3d(15px, 29px, 0px) rotate(-42deg)"
                : size === "small"
                ? "translate3d(12px, 40px, 0px) rotate(-19deg)"
                : "translate3d(12px, 40px, 0px) rotate(-51deg)";

            width =
              size === "large" ? "26px" : size === "small" ? "20px" : "23px";
            // polygone =
            //   size === "large"
            //     ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
            //     : size === "small"
            //     ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
            //     : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

            break;
        }
        break;
      case "C":
        switch (earringType) {
          case "CRAWLER":
            transform =
              size === "large"
                ? "translate(12px, 20px) rotate(14deg)"
                : size === "small"
                ? "translate(12px, 20px) rotate(14deg)"
                : "translate(12px, 20px) rotate(14deg)";
            width =
              size === "large" ? "29px" : size === "small" ? "27px" : "28px";
            break;
          case "KNIFE_EDGED":
            transform =
              size === "large"
                ? "translate3d(7px, 12px, 0px)"
                : size === "small"
                ? "translate3d(7px, 12px, 0px)"
                : "translate3d(7px, 12px, 0px)";
            width =
              size === "large" ? "32px" : size === "small" ? "22px" : "54px";
            break;
          case "MODERN_COLOUR":
            transform =
              size === "large"
                ? "translate3d(9px, 15px, 0px) rotate(1deg)"
                : size === "small"
                ? "translate3d(9px, 15px, 0px) rotate(1deg)"
                : "translate3d(9px, 15px, 0px) rotate(1deg)";

            width =
              size === "large" ? "34px" : size === "small" ? "22px" : "38px";
            break;
          case "BRUSHED":
            transform =
              size === "large"
                ? "translate3d(6px, 30px, 0px) rotate(2deg)"
                : size === "small"
                ? "translate3d(19px, 12px, 0px) rotate(59deg)"
                : "translate3d(19px, 12px, 0px) rotate(59deg)";

            width =
              size === "large" ? "50px" : size === "small" ? "22px" : "32px";
            break;
          case "SIMPLE_HOOP":
            transform =
              size === "large"
                ? "translate3d(3px, 11px, 0px) rotate(2deg)"
                : size === "small"
                ? "translate3d(3px, 11px, 0px) rotate(2deg)"
                : "translate3d(3px, 11px, 0px) rotate(2deg)";

            width =
              size === "large" ? "34px" : size === "small" ? "37px" : "40px";
            break;
          case "STUD":
            transform =
              size === "large"
                ? "translate3d(12px, 28px, 0px) rotate(44deg)"
                : size === "small"
                ? "translate3d(12px, 28px, 0px) rotate(44deg)"
                : "translate3d(12px, 28px, 0px) rotate(44deg)";
            width =
              size === "large" ? "30px" : size === "small" ? "25px" : "27px";
            break;
          case "CLUSTER":
            transform =
              size === "large"
                ? "translate3d(17px, 0px, 0px) rotate(49deg)"
                : size === "small"
                ? "translate3d(21px, 7px, 0px) rotate(72deg)"
                : "translate3d(21px, 7px, 0px) rotate(72deg)";
            width =
              size === "large" ? "29px" : size === "small" ? "27px" : "28px";
            break;
          case "TWISTED_GOLD":
            transform =
              size === "large"
                ? "translate3d(2px, 13px, 0px) rotate(190deg)"
                : size === "small"
                ? "translate3d(-13px, 21px, 0px)"
                : "translate3d(-14px, 11px, 0px)";

            width =
              size === "large" ? "55px" : size === "small" ? "22px" : "28px";
            break;
          default:
            transform =
              size === "large"
                ? "translate3d(12px, 5px, 0px) rotate(-1deg)"
                : size === "small"
                ? "translate3d(21px, 5px, 0px) rotate(122deg)"
                : "translate3d(14px, 5px, 0px) rotate(-1deg)";

            width =
              size === "large" ? "48px" : size === "small" ? "25px" : "45px";
            break;
        }
        break;
      case "DotC":
        switch (earringType) {
          case "CRAWLER":
            transform =
              size === "large"
                ? "translate(12px, 20px) rotate(14deg)"
                : size === "small"
                ? "translate(12px, 20px) rotate(14deg)"
                : "translate(12px, 20px) rotate(14deg)";
            width =
              size === "large" ? "29px" : size === "small" ? "27px" : "28px";
            break;
          case "KNIFE_EDGED":
            transform =
              size === "large"
                ? "translate3d(-23px, 0px, 0px)"
                : size === "small"
                ? "translate3d(-22px, 12px, 0px)"
                : "translate3d(-16px, 5px, 0px)";
            width =
              size === "large" ? "32px" : size === "small" ? "22px" : "28px";
            break;
          case "MODERN_COLOUR":
            transform =
              size === "large"
                ? "translate3d(-23px, 12px, 0px)"
                : size === "small"
                ? "translate3d(-22px, 24px, 0px)"
                : "translate3d(15px, 22px, 0px) rotate(1deg)";

            width =
              size === "large" ? "34px" : size === "small" ? "22px" : "38px";
            break;
          case "BRUSHED":
            transform =
              size === "large"
                ? "translate3d(25px, 11px, 0px) rotate(54deg)"
                : size === "small"
                ? "translate3d(27px, 12px, 0px) rotate(59deg)"
                : "translate3d(27px, 12px, 0px) rotate(59deg)";

            width =
              size === "large" ? "36px" : size === "small" ? "22px" : "32px";
            break;
          case "SIMPLE_HOOP":
            transform =
              size === "large"
                ? "translate3d(-20px, 6px, 0px)"
                : size === "small"
                ? "translate3d(-13px, 21px, 0px)"
                : "translate3d(-14px, 11px, 0px)";

            width =
              size === "large" ? "32px" : size === "small" ? "22px" : "28px";
            break;
          case "STUD":
            transform =
              size === "large"
                ? "translate3d(12px, 28px, 0px) rotate(44deg)"
                : size === "small"
                ? "translate3d(12px, 28px, 0px) rotate(44deg)"
                : "translate3d(12px, 28px, 0px) rotate(44deg)";
            width =
              size === "large" ? "30px" : size === "small" ? "25px" : "27px";
            break;
          case "CLUSTER":
            transform =
              size === "large"
                ? "translate3d(17px, 0px, 0px) rotate(49deg)"
                : size === "small"
                ? "translate3d(21px, 7px, 0px) rotate(72deg)"
                : "translate3d(21px, 7px, 0px) rotate(72deg)";
            width =
              size === "large" ? "29px" : size === "small" ? "27px" : "28px";
            break;
          case "TWISTED_GOLD":
            transform =
              size === "large"
                ? "translate3d(16px, 1px, 0px) rotate(195deg)"
                : size === "small"
                ? "translate3d(-13px, 21px, 0px)"
                : "translate3d(-14px, 11px, 0px)";

            width =
              size === "large" ? "52px" : size === "small" ? "22px" : "28px";
            break;
          default:
            transform =
              size === "large"
                ? "translate3d(20px, 5px, 0px) rotate(126deg)"
                : size === "small"
                ? "translate3d(29px, 5px, 0px) rotate(126deg)"
                : "translate3d(27px, 3px, 0px) rotate(126deg)";

            width =
              size === "large" ? "35px" : size === "small" ? "25px" : "30px";
            break;
        }
        break;
      case "F":
        switch (earringType) {
          case "CRAWLER":
            transform =
              size === "large"
                ? "translate(10px, 14px) rotate(86deg)"
                : size === "small"
                ? "translate(10px, 14px) rotate(86deg)"
                : "translate(10px, 14px) rotate(86deg)";
            width =
              size === "large" ? "29px" : size === "small" ? "27px" : "28px";
            break;
          case "KNIFE_EDGED":
            transform =
              size === "large"
                ? "translate3d(-1px, 1px, 0px) rotate(1deg)"
                : size === "small"
                ? "translate3d(-1px, 1px, 0px) rotate(1deg)"
                : "translate3d(-1px, 2px, 0px) rotate(1deg)";
            width =
              size === "large" ? "32px" : size === "small" ? "22px" : "24px";
            // polygone =
            //   size === "large"
            //     ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
            //     : size === "small"
            //     ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
            //     : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 77.37% 95.29%, 101% 104%, 21% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

            break;
          case "MODERN_COLOUR":
            transform =
              size === "large"
                ? "translate3d(5px, 6px, 0px) rotate(5deg)"
                : size === "small"
                ? "translate3d(5px, 6px, 0px) rotate(5deg)"
                : "translate3d(5px, 6px, 0px) rotate(5deg)";

            width =
              size === "large" ? "34px" : size === "small" ? "22px" : "28px";
            // polygone =
            //   size === "large"
            //     ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
            //     : size === "small"
            //     ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
            //     : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 77.37% 95.29%, 101% 104%, 21% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

            break;
          case "BRUSHED":
            transform =
              size === "large"
                ? "translate3d(8px, -2px, 0px)"
                : size === "small"
                ? "translate3d(8px, -2px, 0px)"
                : "translate3d(8px, 4px, 0px)";

            width =
              size === "large" ? "32px" : size === "small" ? "22px" : "22px";
            // polygone =
            //   size === "large"
            //     ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
            //     : size === "small"
            //     ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
            //     : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

            break;
          case "SIMPLE_HOOP":
            transform =
              size === "large"
                ? "translate3d(3px, 4px, 0px)"
                : size === "small"
                ? "translate3d(3px, 4px, 0px)"
                : "translate3d(3px, 4px, 0px)";

            width =
              size === "large" ? "16px" : size === "small" ? "18px" : "21px";
            // polygone =
            //   size === "large"
            //     ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
            //     : size === "small"
            //     ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
            //     : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

            break;

          case "STUD":
            transform =
              size === "large"
                ? "translate3d(12px, 20px, 0px) rotate(19deg)"
                : size === "small"
                ? "translate3d(12px, 20px, 0px) rotate(19deg)"
                : "translate3d(12px, 20px, 0px) rotate(19deg)";
            width =
              size === "large" ? "30px" : size === "small" ? "25px" : "27px";
            break;
          case "CLUSTER":
            transform =
              size === "large"
                ? "translate3d(15px, 3px, 0px) rotate(138deg)"
                : size === "small"
                ? "translate3d(15px, 12px, 0px) rotate(325deg)"
                : "translate3d(15px, 12px, 0px) rotate(325deg)";
            width =
              size === "large" ? "29px" : size === "small" ? "27px" : "28px";
            break;
          case "TWISTED_GOLD":
            transform =
              size === "large"
                ? "translate3d(8px, -4px, 0px) rotate(9deg)"
                : size === "small"
                ? "translate3d(8px, -4px, 0px) rotate(9deg)"
                : "translate3d(8px, -4px, 0px) rotate(9deg)";

            width =
              size === "large" ? "24px" : size === "small" ? "22px" : "28px";
            break;
          default:
            transform =
              size === "large"
                ? "translate(8px, 10px)"
                : size === "small"
                ? "translate(12px, 14px)"
                : "translate(12px, 14px)";

            width =
              size === "large" ? "29px" : size === "small" ? "20px" : "25px";
            break;
        }
        break;
      case "DotF":
        switch (earringType) {
          case "CRAWLER":
            transform =
              size === "large"
                ? "translate(10px, 14px) rotate(86deg)"
                : size === "small"
                ? "translate(10px, 14px) rotate(86deg)"
                : "translate(10px, 14px) rotate(86deg)";
            width =
              size === "large" ? "29px" : size === "small" ? "27px" : "28px";
            break;
          case "KNIFE_EDGED":
            transform =
              size === "large"
                ? "translate3d(-23px, 0px, 0px)"
                : size === "small"
                ? "translate3d(-22px, 12px, 0px)"
                : "translate3d(-16px, 5px, 0px)";
            width =
              size === "large" ? "32px" : size === "small" ? "22px" : "28px";
            // polygone =
            //   size === "large"
            //     ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
            //     : size === "small"
            //     ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
            //     : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 77.37% 95.29%, 101% 104%, 21% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

            break;
          case "MODERN_COLOUR":
            transform =
              size === "large"
                ? "translate3d(-23px, 12px, 0px)"
                : size === "small"
                ? "translate3d(-22px, 24px, 0px)"
                : "translate3d(-9px, 2px, 0px) rotate(-2deg)";

            width =
              size === "large" ? "34px" : size === "small" ? "22px" : "28px";
            // polygone =
            //   size === "large"
            //     ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
            //     : size === "small"
            //     ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 84.37% 95.29%, 47% 87%, 2% 98%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)"
            //     : "polygon(157% 9px, 91.98% 23.55%, 38.91% 29.77%, 77.37% 95.29%, 101% 104%, 21% 100%, 1% 84%, 8% 82%, -24px 56%, 6px 0px)";

            break;
          case "BRUSHED":
            transform =
              size === "large"
                ? "translate3d(8px, -2px, 0px)"
                : size === "small"
                ? "translate3d(8px, -2px, 0px)"
                : "translate3d(8px, 4px, 0px)";

            width =
              size === "large" ? "32px" : size === "small" ? "22px" : "22px";
            // polygone =
            //   size === "large"
            //     ? "polygon(157% 9px, 100.98% 23.55%, 38.91% 29.77%, 70.37% 85.29%, 148% 115%, 27% 115%, 1% 87%, 8% 82%, -24px 56%, 6px 0px)"
            //     : size === "small"
            //     ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
            //     : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

            break;
          case "SIMPLE_HOOP":
            transform =
              size === "large"
                ? "translate3d(-20px, 6px, 0px)"
                : size === "small"
                ? "translate3d(-13px, 21px, 0px)"
                : "translate3d(-14px, 11px, 0px)";

            width =
              size === "large" ? "32px" : size === "small" ? "22px" : "28px";
            // polygone =
            //   size === "large"
            //     ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
            //     : size === "small"
            //     ? "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)"
            //     : "polygon(54% 0%, 92% 0px, 78.29% 62.77%, 40% 127%, 20.47% 117.42%, 59% 33%, 29% 7%)";

            break;

          case "STUD":
            transform =
              size === "large"
                ? "translate3d(12px, 20px, 0px) rotate(45deg)"
                : size === "small"
                ? "translate3d(12px, 20px, 0px) rotate(45deg)"
                : "translate3d(12px, 20px, 0px) rotate(45deg)";
            width =
              size === "large" ? "30px" : size === "small" ? "25px" : "27px";
            break;
          case "CLUSTER":
            transform =
              size === "large"
                ? "translate3d(15px, 3px, 0px) rotate(138deg)"
                : size === "small"
                ? "translate3d(15px, 12px, 0px) rotate(325deg)"
                : "translate3d(15px, 12px, 0px) rotate(325deg)";
            width =
              size === "large" ? "29px" : size === "small" ? "27px" : "28px";
            break;
          case "TWISTED_GOLD":
            transform =
              size === "large"
                ? "translate3d(-4px, -12px, 0px) rotate(9deg)"
                : size === "small"
                ? "translate3d(-13px, 21px, 0px)"
                : "translate3d(-14px, 11px, 0px)";

            width =
              size === "large" ? "27px" : size === "small" ? "22px" : "28px";
            break;
          default:
            transform =
              size === "large"
                ? "translate(-4px, 7px)"
                : size === "small"
                ? "translate(-4px, 7px)"
                : "translate(-4px, 7px)";

            width =
              size === "large" ? "26px" : size === "small" ? "20px" : "23px";
            break;
        }
        break;
      default:
    }

    return {
      transform,
      width,
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getStyle = (prod: any, pos: any) => {
    console.log(prod, "shikha");

    let style = {};

    const isCircle = prod.shape === "circle";

    const s = getEarringStyleByType(prod?.type, prod?.size, pos);

    if (sideIndex === "left") {
      switch (pos) {
        case "A":
          style = {
            // clipPath:
            //   "polygon(75% 31%, 63% 36%, 74% 34%, 100% 57%, 100% 100%, 42% 100%, 53% 55%, 0% 36%, 54% 7%, 29% 1%)",
            width: s?.width,
            transform: s?.transform,
          };
          break;
        case "B":
          style = {
            width: s?.width,
            transform: s?.transform,
          };
          break;
        case "DotB":
          style = {
            width: s?.width,
            transform: s?.transform,
          };
          break;
        case "C":
          style = {
            width: s?.width,
            transform: s?.transform,
          };
          break;
        case "DotC":
          style = {
            width: s?.width,
            transform: s?.transform,
          };
          break;
        case "D":
          style = {
            width: s?.width,
            transform: s?.transform,
          };
          break;
        case "DotD":
          style = {
            ...(isCircle && {
              clipPath:
                "polygon(57% 8%, 80% 12%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 3% 58%, 50% 67%)",
            }),
            width: s?.width,
            transform: s?.transform,
          };
          break;
        case "E":
          style = {
            width: s?.width,
            transform: s?.transform,
          };
          break;
        case "DotE":
          style = {
            width: s?.width,
            transform: s?.transform,
          };
          break;
        case "D1":
          style = {
            // clipPath: clipPathLookup["left"][pos] ,
            width: "32px",
            transform: "translate3d(11px,16px,0px)",
          };
          break;
        case "F":
          style = {
            width: s?.width,
            transform: s?.transform,
          };
          break;
        case "DotF":
          style = {
            width: s?.width,
            transform: s?.transform,
          };
          break;
      }
    }

    if (sideIndex === "right") {
      switch (pos) {
        case "A":
          style = {};
          break;
        case "B":
          style = {};
          break;
        case "C":
          style = {
            clipPath:
              "polygon(75% 31%, 63% 36%, 74% 34%, 100% 57%, 100% 100%, 42% 100%, 53% 55%, 0% 36%, 54% 7%, 29% 1%)",
            transform: "translate3d(21px, 7px, 0px)",
          };
          break;
        case "D":
          style = {
            clipPath:
              "polygon(57% 8%, 80% 12%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 3% 58%, 50% 67%)",
            width: "30px",
          };
          break;
        case "E":
          style = {};
          break;
      }
    }

    return style;
  };

  return (
    <div className="main-content-area" ref={addProductIdRef}>
      {/* <Banner/> */}
      <DndContext
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        sensors={sensors}
        onDragMove={handleDragMove}
        collisionDetection={closestCenter}
      >
        <div
          className="flex gap-4 flex-wrap m-0 show-product-area"
          id="lark-and-berry"
        >
          <div className="page-content-area">
            <div className="lark-bery-left-image-cover">
              {/* Options button */}
              <div className="flex justify-between p-2 bg-black-img">
                <h2 className="text-lg text-white font-semibold">
                  Lark & Berry
                </h2>

                <div className="cursor-pointer text-white">
                  <OptionsMenu
                    earRef={earRef}
                    setCurrentPoint={setCurrentPoint}
                  />
                </div>
              </div>

              {/* Options button */}
              {/* 
                  Drop area ie: Ear and points 
              */}
              <div
                ref={earRef}
                className="bg-gray-100 rounded-md shadow-lg flex justify-center items-center relative h-[400px] w-[375px] lark-berry-ears-image"
              >
                {/* Drop Points */}
                <div
                  className="flex gap-2 flex-col absolute top-0 left-0 z-10"
                  ref={droppableRef}
                >
                  <div className="h-full w-full">
                    {(side == "L" ? dropPointsLeft : dropPointsRight).map((p) => {
                      // const position = p.id;
                      // const imageIndex =
                      //   position.charCodeAt(0) - "A".charCodeAt(0);
                      // const imageUrl   = imageMappings[position];
                      return (
                        <div
                          className={`circle`}
                          key={`${p.id}${Math.random()
                            .toString(36)
                            .replace("0.", "circle" || "")}`}
                          style={{
                            position: "absolute",
                            top: `${p.y}px`,
                            left: `${p.x}px`,
                            border: isDragging && ringType === "circle" ? `1px solid grey`:''
                          }}
                        >
                          <DroppableComp
                            id={p.id}
                            key={p.id}
                            disabled={p.disabled}
                            ringType={ringType}
                          >
                            {annotations !== undefined &&
                              annotations[sideIndex] !== undefined &&
                              annotations[sideIndex][p.id] !== undefined && (
                                <DraggbleComp id={p.id} >
                                  <div className="group relative h-full w-full">
                                    {
                                      annotations[sideIndex][p.id]?.shape ==
                                        "circle" && (
                                        <>
                                       
                                          <img
                                            className={"image" + p.id}
                                            src={
                                              annotations[sideIndex][p.id]
                                                .images[p.id as Position]
                                            }
                                            // src={imageUrl}
                                            style={{
                                              ...getStyle(
                                                annotations[sideIndex][p.id],
                                                p.id
                                              ),
                                            }}
                                          />
                                         {/* {isDragging && (
                                            <div className="drag-message">
                                              {showMessage}
                                            </div>
                                          )} */}
                                        </>
                                      )

                                      //  annotations[sideIndex][p.id]?.type ===
                                      //     "CRAWLER" ||
                                      //   annotations[sideIndex][p.id]?.type ===
                                      //     "CLUSTER" ||
                                      //   annotations[sideIndex][p.id]?.type ===
                                      //     "STUD" ? (
                                      //   <>
                                      //     <div className={"dot"}>
                                      //       <img
                                      //         src={
                                      //           annotations[sideIndex][p.id]
                                      //             ?.images["dotsImage"]
                                      //           // Image
                                      //         }
                                      //         alt=""
                                      //         className={`dot`}
                                      //         style={{
                                      //           height: "auto",
                                      //           objectFit: "contain",
                                      //           ...getStyle(
                                      //             annotations[sideIndex][p.id],
                                      //             p.id
                                      //           ),
                                      //           transition:
                                      //             "transform 0.5s ease-in-out",
                                      //           ...(sideIndex === "right"
                                      //             ? {
                                      //                 transform: "scaleX(1)",
                                      //               }
                                      //             : {}),
                                      //         }}
                                      //       />
                                      //     </div>
                                      //   </>
                                      // ) : (
                                      //   <>
                                      //     <img
                                      //       src={
                                      //         annotations[sideIndex][p.id]
                                      //           ?.images["dotsImage"]
                                      //         // Image
                                      //       }
                                      //       alt=""
                                      //       style={{}}
                                      //     />
                                      //   </>
                                      // )
                                    }
                                  </div>
                                </DraggbleComp>
                              )}
                          </DroppableComp>
                        </div>
                      );
                    })}
                  </div>

                  <div className="h-full w-full">
                    {(side == "L" ? dropPointsForDotCrawleronLeft : dropPointsForDotCrawleronRight).map((p) => {
                      return (
                        <div
                          className={`dot`}
                          key={p.id}
                          style={{
                            position: "absolute",
                            top: `${p.y}px`,
                            left: `${p.x}px`,
                            border: isDragging && ringType === "dot" ? `1px solid grey`:''
                          }}
                        >
                          <DroppableDotComp
                            id={p.id}
                            key={p.id}
                            disabled={p.disabled}
                            ringType={ringType}
                          >
                            {annotations !== undefined &&
                              annotations[sideIndex] !== undefined &&
                              annotations[sideIndex][p.id] !== undefined && (
                                <DraggableDotComp id={p.id}>
                                  <div className="group relative h-full w-full">
                                    {annotations[sideIndex][p.id]?.shape ==
                                      "dot" && (
                                      <>
                                        {/* <img
                                            className={"image" + p.id}
                                            src={
                                              annotations[sideIndex][p.id]
                                                .images[p.id as Position]
                                            }
                                            // src={imageUrl}
                                            style={{
                                              ...getStyle(
                                                annotations[sideIndex][p.id],
                                                p.id
                                              ),
                                            }}
                                          /> */}
                                        <img
                                          src={
                                            annotations[sideIndex][p.id]
                                              ?.images["dotsImage"]
                                          }
                                          alt=""
                                          className={`dot`}
                                          style={{
                                            height: "auto",
                                            objectFit: "contain",
                                            ...getStyle(
                                              annotations[sideIndex][p.id],
                                              p.id
                                            ),
                                            transition:
                                              "transform 0.5s ease-in-out",
                                            ...(sideIndex === "right"
                                              ? {
                                                  transform: "scaleX(1)",
                                                }
                                              : {}),
                                          }}
                                        />
                                      </>
                                    )}
                                  </div>
                                </DraggableDotComp>
                              )}
                          </DroppableDotComp>
                        </div>
                      );
                    })}
                  </div>

                  <div className="h-full w-full">
                    {(side == "L" ? dropPointsLeftAddOnLeft : dropPointsRightAddOnRight).map((p) => {
                      return (
                        <div
                          className={`addon`}
                          key={p.id}
                          style={{
                            position: "absolute",
                            top: `${p.y}px`,
                            left: `${p.x}px`,
                            border: isDragging && ringType === "addon" ? `1px solid grey`:''
                          }}
                        >
                          <DroppableAddOnComp
                            id={p.id}
                            key={p.id}
                            disabled={p.disabled}
                            ringType={ringType}
                          >
                            {annotations !== undefined &&
                              annotations[sideIndex] !== undefined &&
                              annotations[sideIndex][p.id] !== undefined && (
                                <DraggbleAddOnComp id={p.id}>
                                  <div className="group relative h-full w-full">
                                    {annotations[sideIndex][p.id].shape ===
                                      "addon" && (
                                      <>
                                        <img
                                          className={"image" + p.id}
                                          src={
                                            annotations[sideIndex][p.id]?.images
                                              .dotsImage
                                          }
                                          alt="test"
                                          // style={{
                                          //   height: "auto",
                                          //   ...getStyle(
                                          //     annotations[sideIndex][p.id],
                                          //     p.id
                                          //   ),
                                          // }}
                                        />
                                      </>
                                    )}
                                  </div>
                                </DraggbleAddOnComp>
                              )}
                          </DroppableAddOnComp>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* {errorMessagePoints ? (
                  <div
                    style={{
                      color: "danger",
                      background: "#fff",
                      width: "100%",
                      padding: "5px",
                      zIndex: "999",
                    }}
                  >
                    {errorMessagePoints}
                  </div>
                ) : (
                  ""
                )} */}

                {/* Drop Points */}

                <Ear />

                {/* Drop area ie: Ear */}
                {currentPoint ? (
                  <button
                    className="absolute bottom-2 right-6 hover:underline text-white  px-1 rounded-sm lark-berry-remove"
                    onClick={() => {
                      remove();
                    }}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <div>{/* <HeaderContent/> */}</div>
              {/* Buy Button */}
              <div className="flex justify-center w-full  btn-prod-view">
                {isMobile ? null : (
                  <BuyButton addedProducts={addedProduts} earRef={earRef} />
                  //  <>
                  //   <MobileView />
                  //   </>
                )}
              </div>
              {/* Buy Button */}
            </div>
          </div>

          {/* Tabs */}
          <Tabs dragDataX={dragDataX} updateDragDataX={setDragDataY} isDragging ={isDragging} />
          {/* Tabs */}
        </div>
        {/* <HeaderContent/> */}
      </DndContext>
    </div>
  );
};
export default View;
