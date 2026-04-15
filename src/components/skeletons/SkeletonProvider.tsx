import React from "react";
import { SkeletonProvider as Provider } from "react-skeletonify";

interface Props {
  children: React.ReactNode;
}

export default function SkeletonProvider({ children }: Props) {
  return (
    <Provider
      config={{
        animation: "animation-1",
        borderRadius: "8px",
        animationSpeed: 2,
        shimmerColor: "#f3f4f6", // tailwind gray-100 equivalent or default
        baseColor: "#e5e7eb", // tailwind gray-200 equivalent
      }}
    >
      {children}
    </Provider>
  );
}
