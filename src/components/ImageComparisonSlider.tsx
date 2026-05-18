import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageComparisonSliderProps {
  leftImage: string;
  rightImage: string;
  altLeft?: string;
  altRight?: string;
  initialPosition?: number;
  labelLeft?: string;
  labelRight?: string;
}

export default function ImageComparisonSlider({
  leftImage,
  rightImage,
  altLeft = "Before",
  altRight = "After",
  initialPosition = 50,
  labelLeft = "Before",
  labelRight = "After",
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = React.useState(initialPosition);
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let newPosition = (x / rect.width) * 100;
    newPosition = Math.max(0, Math.min(100, newPosition));
    setSliderPosition(newPosition);
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => { if (isDragging) handleMove(e.clientX); };
    const handleTouchMove = (e: TouchEvent) => { if (isDragging) handleMove(e.touches[0].clientX); };
    const handleEnd = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchend", handleEnd);
      document.body.style.cursor = "ew-resize";
    } else {
      document.body.style.cursor = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchend", handleEnd);
      document.body.style.cursor = "";
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden select-none group rounded-lg border border-white/10 aspect-[16/9] cursor-ew-resize"
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
    >
      {/* Right image (bottom layer — "After") */}
      <img
        src={rightImage}
        alt={altRight}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
      />

      {/* Left image (top layer — "Before", clipped) */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
      >
        <img
          src={leftImage}
          alt={altLeft}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Labels */}
      <span className="absolute top-3 left-3 bg-black/70 text-white text-[10px] uppercase tracking-wider px-2 py-1 backdrop-blur-sm pointer-events-none font-inter">
        {labelLeft}
      </span>
      <span className="absolute top-3 right-3 bg-black/70 text-white text-[10px] uppercase tracking-wider px-2 py-1 backdrop-blur-sm pointer-events-none font-inter">
        {labelRight}
      </span>

      {/* Slider divider line + handle */}
      <div
        className="absolute top-0 h-full w-0.5"
        style={{ left: `calc(${sliderPosition}% - 1px)` }}
      >
        <div className="absolute inset-y-0 w-0.5 bg-white/50 backdrop-blur-sm"></div>
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-black/60 text-white shadow-xl backdrop-blur-md border border-white/20 transition-transform duration-200 ${isDragging ? "scale-110" : "group-hover:scale-105"}`}
          role="slider"
          aria-valuenow={sliderPosition}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-orientation="horizontal"
          aria-label="Image comparison slider"
        >
          <ChevronLeft className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
