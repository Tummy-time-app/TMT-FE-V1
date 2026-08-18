"use client";

import Lottie from 'lottie-react';

interface LottieIconProps {
  animationData: object;
  className?: string;
  loop?: boolean;
}

const LottieIcon = ({ animationData, className = '', loop = false }: LottieIconProps) => {
  return (
    <div className={className} aria-hidden="true">
      <Lottie animationData={animationData} loop={loop} autoplay />
    </div>
  );
};

export default LottieIcon;
