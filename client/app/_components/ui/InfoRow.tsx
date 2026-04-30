import { ReactNode } from "react";

const InfoRow = ({
  Left,
  Right,
}: {
  Left: ReactNode | string;
  Right: ReactNode | string;
}) => {
  return (
    <div className="grid grid-cols-2 place-items-center">
      <div className="w-full">{Left}</div>
      <div className="flex items-center w-full">
        <p className="max-w-fit mr-10">:</p>
        <div className="w-full">{Right}</div>
      </div>
    </div>
  );
};

export default InfoRow;
