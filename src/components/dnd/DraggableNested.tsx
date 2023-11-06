
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { IProduct } from "../tabs/data.type";

const DraggableNested = ({
  id,
  data,
}: {
  id: string;
  data: IProduct;
  isDragging: string;
}) => {
  
  // const [setId, setSetId] = useState([id]);
  const { attributes, transform, setNodeRef, listeners } = useDraggable({
    id: id.toString(),
  });

  console.log(data,"pinky")
 

  return (
    <div className="cursor-pointer product-list mb-5">
      <div className="p-2 bg-gray-100  view-product flex justify-center items-center">
        {/* {setId.map((id) => ( */}
        <div
          key={id}
          ref={setNodeRef}
          draggable="false"
          style={{
            transform: CSS.Translate.toString(transform),
            touchAction: "auto",
          }}
          {...attributes}
          {...listeners}
        >
          <img
            className={
              "w-full product-img object-contain" +
              (transform ? " custom-ring-image" : "")
            }
            src={data?.imageTransparent}
            alt=""
          />
        </div>
        {/* ))} */}
      </div>
      <div className="text-left">
        <p className="text-sm truncate lark-berry-vendor ">{data?.vendor}</p>
        <p className="text-sm truncate lark-berry-title focus-inset">
          {data?.title}
        </p>
        <p className="text-sm truncate lark-berry-price">
          {data?.currency_code} {data?.price}
        </p>
      </div>
    </div>
  );
};
export default DraggableNested;
