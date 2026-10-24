import type {
  CSSProperties,
  ElementType,
  HTMLAttributes,
  PointerEvent,
  ReactNode,
} from "react";
import "./TiltedCard.css";

type CardTag =
  | "article"
  | "details"
  | "div"
  | "fieldset"
  | "header"
  | "li"
  | "section";

export interface TiltedCardProps extends HTMLAttributes<HTMLElement> {
  as?: CardTag;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  rotateAmplitude?: number;
  scaleOnHover?: number;
  glare?: number;
  perspective?: number;
}

const TiltedCard = ({
  as = "div",
  children,
  className = "",
  style,
  rotateAmplitude = 8,
  scaleOnHover = 1.015,
  glare = 0.18,
  perspective = 900,
  onPointerMove,
  onPointerLeave,
  ...props
}: TiltedCardProps) => {
  const CardElement: ElementType = as;

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    onPointerMove?.(event);
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    const tiltX = (0.5 - y) * rotateAmplitude;
    const tiltY = (x - 0.5) * rotateAmplitude;
    event.currentTarget.style.setProperty("--tilt-card-x", `${tiltX}deg`);
    event.currentTarget.style.setProperty("--tilt-card-y", `${tiltY}deg`);
    event.currentTarget.style.setProperty("--tilt-card-glare-x", `${x * 100}%`);
    event.currentTarget.style.setProperty("--tilt-card-glare-y", `${y * 100}%`);
    event.currentTarget.style.setProperty("--tilt-card-glare", `${glare}`);
    event.currentTarget.style.setProperty("--tilt-card-scale", `${scaleOnHover}`);
    event.currentTarget.dataset.tiltActive = "true";
  };

  const handlePointerLeave = (event: PointerEvent<HTMLElement>) => {
    onPointerLeave?.(event);
    delete event.currentTarget.dataset.tiltActive;
    event.currentTarget.style.removeProperty("--tilt-card-x");
    event.currentTarget.style.removeProperty("--tilt-card-y");
    event.currentTarget.style.removeProperty("--tilt-card-glare");
    event.currentTarget.style.removeProperty("--tilt-card-scale");
  };

  return (
    <CardElement
      {...props}
      className={`tilted-card-surface ${className}`.trim()}
      style={
        {
          ...style,
          "--tilt-card-perspective": `${perspective}px`,
        } as CSSProperties
      }
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
      <span className="tilted-card-surface__glare" aria-hidden="true" />
    </CardElement>
  );
};

export default TiltedCard;
