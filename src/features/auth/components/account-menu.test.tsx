import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AccountMenu } from "./account-menu";

const { logoutAction } = vi.hoisted(() => ({
  logoutAction: vi.fn<() => Promise<void>>(),
}));
vi.mock("@/features/auth/actions", () => ({ logoutAction }));

function renderMenu() {
  const user = userEvent.setup();
  render(
    <>
      <AccountMenu fullName="camila Torres" email="camila@renest.app" />
      <p>Outside</p>
    </>,
  );
  return { user, trigger: screen.getByRole("button", { name: "Mi cuenta" }) };
}

describe("AccountMenu", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("shows the user's initial on a closed menu button", () => {
    const { trigger } = renderMenu();

    expect(trigger).toHaveTextContent("C");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: "Cerrar sesión" })).not.toBeInTheDocument();
  });

  it("opens with the user's details and focuses the logout button", async () => {
    const { user, trigger } = renderMenu();

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("camila Torres")).toBeVisible();
    expect(screen.getByText("camila@renest.app")).toBeVisible();
    expect(screen.getByRole("button", { name: "Cerrar sesión" })).toHaveFocus();
  });

  it("closes on Escape and returns focus to the menu button", async () => {
    const { user, trigger } = renderMenu();
    await user.click(trigger);

    await user.keyboard("{Escape}");

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("closes on a click outside", async () => {
    const { user, trigger } = renderMenu();
    await user.click(trigger);

    await user.click(screen.getByText("Outside"));

    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("signs out with the logout action", async () => {
    logoutAction.mockResolvedValueOnce(undefined);
    const { user, trigger } = renderMenu();
    await user.click(trigger);

    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    expect(logoutAction).toHaveBeenCalledTimes(1);
  });
});
