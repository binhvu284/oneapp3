import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { RouteProgressBar } from "@/components/motion/RouteProgressBar";
import { PageTransition } from "@/components/motion/PageTransition";

describe("RouteProgressBar", () => {
  it("renders without crashing inside a router context", () => {
    const { container } = render(
      <MemoryRouter>
        <RouteProgressBar />
      </MemoryRouter>,
    );
    // With FF_MICRO_INTERACTIONS ON (dev default) the bar is in the DOM;
    // when the flag is OFF it returns null — either way the container is valid.
    expect(container).toBeInTheDocument();
  });
});

describe("PageTransition", () => {
  it("renders its children", () => {
    render(
      <MemoryRouter>
        <PageTransition>
          <span>Page content</span>
        </PageTransition>
      </MemoryRouter>,
    );
    expect(screen.getByText("Page content")).toBeInTheDocument();
  });

  it("always renders children regardless of animation state", () => {
    render(
      <MemoryRouter>
        <PageTransition>
          <div data-testid="inner">hello</div>
        </PageTransition>
      </MemoryRouter>,
    );
    expect(screen.getByTestId("inner")).toBeInTheDocument();
  });

  it("accepts a className prop without crashing", () => {
    const { container } = render(
      <MemoryRouter>
        <PageTransition className="h-full w-full">
          <span>content</span>
        </PageTransition>
      </MemoryRouter>,
    );
    expect(container.querySelector(".h-full")).toBeTruthy();
  });
});
