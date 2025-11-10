import RegisterPage from "@/app/(auth)/register/page";
import { renderWithProviders } from "@/tests/utils/render-with-providers";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();
const mockMutateAsync = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock("@/features/auth/queries/use-register-mutation", () => ({
  useRegisterMutation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockMutateAsync.mockReset();
  });

  it("renders the register form", () => {
    renderWithProviders(<RegisterPage />);

    expect(
      screen.getByRole("heading", { name: /create your account/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i }),
    ).toBeInTheDocument();
  });

  it("submits registration details and redirects on success", async () => {
    mockMutateAsync.mockResolvedValueOnce({
      message: "User registered successfully",
      user: {
        id: "user-2",
        name: "Fachri",
        email: "fachri@mail.com",
      },
      accessToken: "token",
      refreshToken: "refresh",
    });

    renderWithProviders(<RegisterPage />);

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/full name/i), "Fachri");
    await user.type(
      screen.getByLabelText(/email address/i),
      "fachri@mail.com",
    );
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(
      screen.getByLabelText(/confirm password/i),
      "password123",
    );

    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: "Fachri",
        email: "fachri@mail.com",
        password: "password123",
        confirmPassword: "password123",
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });
});

