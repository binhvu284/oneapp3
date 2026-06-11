import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { EXPO_OUT, TIMING, springs, pressVariants, staggerItem, staggerContainer } from "@/lib/motion";
import { Pressable } from "@/components/motion/Pressable";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

describe("Phase 4 motion tokens", () => {
  it("exposes the expo-out easing curve", () => {
    expect(EXPO_OUT).toEqual([0.16, 1, 0.3, 1]);
  });

  it("defines ascending micro/fast/page timings", () => {
    expect(TIMING.micro).toBeLessThan(TIMING.fast);
    expect(TIMING.fast).toBeLessThan(TIMING.page);
  });

  it("defines spring presets with type spring", () => {
    expect(springs.soft.type).toBe("spring");
    expect(springs.snappy.type).toBe("spring");
  });

  it("press variants scale down to 0.96 when pressed", () => {
    expect(pressVariants.rest).toMatchObject({ scale: 1 });
    expect(pressVariants.pressed).toMatchObject({ scale: 0.96 });
  });

  it("stagger container threads the configured delay to children", () => {
    const variants = staggerContainer(0.1) as { show: { transition: { staggerChildren: number } } };
    expect(variants.show.transition.staggerChildren).toBe(0.1);
    expect(staggerItem.hidden).toMatchObject({ opacity: 0 });
    expect(staggerItem.show).toMatchObject({ opacity: 1 });
  });
});

describe("Phase 4 motion components", () => {
  it("Pressable renders its children", () => {
    render(<Pressable>Tap me</Pressable>);
    expect(screen.getByText("Tap me")).toBeInTheDocument();
  });

  it("Stagger renders all wrapped items", () => {
    render(
      <Stagger>
        <StaggerItem>First</StaggerItem>
        <StaggerItem>Second</StaggerItem>
      </Stagger>,
    );
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });
});
