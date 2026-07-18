import { useCountUp } from "../hooks/useCountUp";

export default function NumberCounter({ value, decimals = 0, prefix = "", suffix = "", className = "" }) {
  const animated = useCountUp(value, 1200, decimals);
  return (
    <span className={className}>
      {prefix}
      {animated.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
