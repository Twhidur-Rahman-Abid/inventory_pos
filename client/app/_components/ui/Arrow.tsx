import Image from "next/image";

const Arrow = ({
  move = "down",
  className = "",
}: {
  move?: "up" | "down" | "left" | "right";
  className?: string;
}) => {
  let width = 8;
  let height = 4;
  let rotation = 0; // To handle rotation

  // Adjust width, height, and rotation based on the direction
  if (move === "left" || move === "right") {
    width = 4;
    height = 8;

    // Set rotation based on the move prop
    if (move === "left") {
      rotation = 90; // Rotate 90 degrees for left
    } else if (move === "right") {
      rotation = -90; // Rotate -90 degrees for right
    }
  } else if (move === "up" || move === "down") {
    if (move === "up") {
      rotation = 180; // Rotate 180 degrees for up
    } else if (move === "down") {
      rotation = 0; // No rotation for down (default)
    }
  }

  return (
    <div style={{ transform: `rotate(${rotation}deg)` }}>
      <Image
        src="/icon/i-arrow-down.svg"
        width={width}
        height={height}
        alt="arrow"
        className={className}
      />
    </div>
  );
};

export default Arrow;
