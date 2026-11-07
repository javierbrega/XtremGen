"use client";

import React from "react";

type MotionProps<T extends HTMLElement> = React.HTMLAttributes<T> & {
  initial?: Record<string, unknown>;
  animate?: Record<string, unknown>;
  exit?: Record<string, unknown>;
  transition?: Record<string, unknown>;
  whileHover?: Record<string, unknown>;
  whileTap?: Record<string, unknown>;
  whileInView?: Record<string, unknown>;
  viewport?: Record<string, unknown>;
  layout?: boolean;
};

const MotionDiv = React.forwardRef<HTMLDivElement, MotionProps<HTMLDivElement>>(
  (
    {
      initial: _initial,
      animate: _animate,
      exit: _exit,
      transition: _transition,
      whileHover: _whileHover,
      whileTap: _whileTap,
      whileInView: _whileInView,
      viewport: _viewport,
      layout: _layout,
      children,
      ...rest
    },
    ref
  ) => (
    <div ref={ref} {...rest}>
      {children}
    </div>
  )
);
MotionDiv.displayName = "MotionDiv";

const MotionButton = React.forwardRef<
  HTMLButtonElement,
  MotionProps<HTMLButtonElement> & React.ButtonHTMLAttributes<HTMLButtonElement>
>(
  (
    {
      initial: _initial,
      animate: _animate,
      exit: _exit,
      transition: _transition,
      whileHover: _whileHover,
      whileTap: _whileTap,
      whileInView: _whileInView,
      viewport: _viewport,
      layout: _layout,
      children,
      ...rest
    },
    ref
  ) => (
    <button ref={ref} {...rest}>
      {children}
    </button>
  )
);
MotionButton.displayName = "MotionButton";

export const motion = {
  div: MotionDiv,
  button: MotionButton,
};

export function AnimatePresence({
  children,
}: {
  children: React.ReactNode;
  mode?: string;
}) {
  return <>{children}</>;
}
