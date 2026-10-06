import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { LoginState } from "@/features/auth/form-state";

import { LoginForm } from "./login-form";

const { loginAction } = vi.hoisted(() => ({
  loginAction: vi.fn<(prev: LoginState, formData: FormData) => Promise<LoginState>>(),
}));
vi.mock("@/features/auth/actions", () => ({ loginAction }));

async function submit(email: string, password: string) {
  const user = userEvent.setup();
  render(<LoginForm next="/listings" />);

  await user.type(screen.getByLabelText("Correo"), email);
  await user.type(screen.getByLabelText("Contraseña"), password);
  await user.click(screen.getByRole("button", { name: "Entrar" }));
}

describe("LoginForm", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("shows the credentials error and keeps the email", async () => {
    loginAction.mockResolvedValueOnce({
      status: "error",
      formError: "Correo o contraseña incorrectos",
      fieldErrors: {},
      values: { email: "camila@renest.app" },
    });

    await submit("camila@renest.app", "wrong-password");

    expect(await screen.findByRole("alert")).toHaveTextContent("Correo o contraseña incorrectos");
    expect(screen.getByLabelText("Correo")).toHaveValue("camila@renest.app");
    expect(screen.getByLabelText("Contraseña")).toHaveValue("");
  });

  it("sends the credentials and the next path to the action", async () => {
    loginAction.mockResolvedValueOnce({ status: "idle" });

    await submit("camila@renest.app", "secret123");

    const formData = loginAction.mock.calls[0]?.[1];
    expect(formData?.get("email")).toBe("camila@renest.app");
    expect(formData?.get("password")).toBe("secret123");
    expect(formData?.get("next")).toBe("/listings");
  });

  it("disables the button while signing in", async () => {
    const pending = Promise.withResolvers<LoginState>();
    loginAction.mockReturnValueOnce(pending.promise);

    await submit("camila@renest.app", "secret123");

    expect(await screen.findByRole("button", { name: "Entrando…" })).toBeDisabled();
    // React entangles pending async actions, so a never-settled one would block later tests.
    await act(async () => pending.resolve({ status: "idle" }));
  });

  it("links a field error to its input", async () => {
    loginAction.mockResolvedValueOnce({
      status: "error",
      fieldErrors: { password: ["Ingresa tu contraseña"] },
      values: { email: "camila@renest.app" },
    });

    await submit("camila@renest.app", "x");

    await screen.findByText("Ingresa tu contraseña");
    const password = screen.getByLabelText("Contraseña");
    expect(password).toHaveAttribute("aria-invalid", "true");
    expect(password).toHaveAccessibleDescription("Ingresa tu contraseña");
    expect(password).toHaveFocus();
  });
});
