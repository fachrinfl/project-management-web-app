import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { Button } from "@/shared/components/ui/button";
import { renderWithProviders } from "@/tests/utils/render-with-providers";

describe("Button", () => {
  it("renders provided text", () => {
    renderWithProviders(<Button>Click me</Button>);

    expect(
      screen.getByRole("button", { name: /click me/i }),
    ).toBeInTheDocument();
  });
});

