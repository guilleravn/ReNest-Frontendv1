import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { RegisterState, RegisterValues } from "@/features/auth/form-state";

import { RegisterForm } from "./register-form";

const { registerAction } = vi.hoisted(() => ({
  registerAction: vi.fn<(prev: RegisterState, formData: FormData) => Promise<RegisterState>>(),
}));
vi.mock("@/features/auth/actions", () => ({ registerAction }));

const ZONES = ["Condesa, CDMX", "Palermo, Buenos Aires"];

const VALUES: RegisterValues = {
  fullName: "Camila Torres",
  email: "camila@renest.app",
  city: "Palermo, Buenos Aires",
  phoneE164: "+54 9 11 2345 6789",
};

async function fillAndSubmit() {
  const user = userEvent.setup();
  render(<RegisterForm zones={ZONES} />);

  await user.type(screen.getByLabelText("Nombre"), VALUES.fullName);
  await user.type(screen.getByLabelText("Correo"), VALUES.email);
  await user.selectOptions(screen.getByLabelText("Tu zona"), VALUES.city);
  await user.type(screen.getByLabelText("Teléfono"), VALUES.phoneE164);
  await user.type(screen.getByLabelText("Contraseña"), "secret123");
  await user.click(screen.getByRole("button", { name: "Crear cuenta" }));
}

describe("RegisterForm", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("shows field errors linked to their fields", async () => {
    registerAction.mockResolvedValueOnce({
      status: "error",
      fieldErrors: {
        city: ["Elige tu zona para coordinar recogidas"],
        phoneE164: ["Teléfono no válido"],
      },
      values: { ...VALUES, city: "" },
    });

    await fillAndSubmit();

    await screen.findByText("Teléfono no válido");
    const city = screen.getByLabelText("Tu zona");
    expect(city).toHaveAttribute("aria-invalid", "true");
    expect(city).toHaveAccessibleDescription(
      "Para mostrarte artículos cerca y coordinar recogidas. Elige tu zona para coordinar recogidas",
    );
    expect(city).toHaveFocus();
    expect(screen.getByLabelText("Teléfono")).toHaveAccessibleDescription(
      "Opcional Se usa para coordinar la entrega por WhatsApp. Teléfono no válido",
    );
    expect(screen.getByLabelText("Nombre")).not.toHaveAttribute("aria-invalid");
  });

  it("keeps the entered values, except the password", async () => {
    registerAction.mockResolvedValueOnce({
      status: "error",
      fieldErrors: { phoneE164: ["Teléfono no válido"] },
      values: VALUES,
    });

    await fillAndSubmit();

    expect(await screen.findByText("Teléfono no válido")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toHaveValue(VALUES.fullName);
    expect(screen.getByLabelText("Correo")).toHaveValue(VALUES.email);
    expect(screen.getByLabelText("Tu zona")).toHaveValue(VALUES.city);
    expect(screen.getByLabelText("Teléfono")).toHaveValue(VALUES.phoneE164);
    expect(screen.getByLabelText("Contraseña")).toHaveValue("");
  });

  it("shows the duplicate email message on the email field", async () => {
    registerAction.mockResolvedValueOnce({
      status: "error",
      fieldErrors: { email: ["Ya existe una cuenta con este correo."] },
      values: VALUES,
    });

    await fillAndSubmit();

    await screen.findByText("Ya existe una cuenta con este correo.");
    expect(screen.getByLabelText("Correo")).toHaveAccessibleDescription(
      "Ya existe una cuenta con este correo.",
    );
  });

  it("shows a form error when ReNest can't be reached", async () => {
    registerAction.mockResolvedValueOnce({
      status: "error",
      formError: "No pudimos conectar con ReNest. Intenta de nuevo.",
      fieldErrors: {},
      values: VALUES,
    });

    await fillAndSubmit();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No pudimos conectar con ReNest. Intenta de nuevo.",
    );
  });

  it("disables the button while the account is being created", async () => {
    const pending = Promise.withResolvers<RegisterState>();
    registerAction.mockReturnValueOnce(pending.promise);

    await fillAndSubmit();

    expect(await screen.findByRole("button", { name: "Creando cuenta…" })).toBeDisabled();
    // React entangles pending async actions, so a never-settled one would block later tests.
    await act(async () => pending.resolve({ status: "idle" }));
  });
});
