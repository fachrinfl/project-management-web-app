import LoginPage from "@/app/(auth)/login/page";
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

vi.mock("@/features/auth/queries/use-login-mutation", () => ({
  useLoginMutation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockMutateAsync.mockReset();
  });

  it("renders the login form", () => {
    renderWithProviders(<LoginPage />);

    expect(
      screen.getByRole("heading", { name: /welcome back/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("submits credentials and redirects on success", async () => {
    mockMutateAsync.mockResolvedValueOnce({
      message: "Login successful",
      user: {
        id: "user-1",
        name: "Fachri",
        email: "fachri@mail.com",
      },
      accessToken: "token",
      refreshToken: "refresh",
    });

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    const user = userEvent.setup();

    await user.type(emailInput, "fachri@mail.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: "fachri@mail.com",
        password: "password123",
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });
});

