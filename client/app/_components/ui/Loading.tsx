import React from "react";
import { cn } from "../../_lib/utils";

const Loading = ({ isBlack = false }) => {
  return (
    <div className="w-full">
      <div className="flex w-full justify-center space-x-2">
        <div
          className={cn(`w-4 h-4 rounded-full bg-primary animate-bounce`, {
            "bg-gray-900": isBlack,
          })}
        ></div>
        <div
          className={cn(
            "w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:0.2s]",
            { "bg-gray-900": isBlack },
          )}
        ></div>
        <div
          className={cn(
            "w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:0.4s]",
            { "bg-gray-900": isBlack },
          )}
        ></div>
      </div>
    </div>
  );
};

export default Loading;
