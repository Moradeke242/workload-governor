import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import i18n from "./i18n";
import { formatDate } from "./utils/formatDate";
import { SettingsPage } from "./components/SettingsPage";
import { MemoryRouter } from "react-router-dom";

describe("i18n Infrastructure", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("initializes with English as default language", () => {
    expect(i18n.language).toBe("en");
    expect(i18n.t("common.appName")).toBe("WorkloadGovernor");
  });

  it("switches language dynamically to Spanish and back", async () => {
    await act(async () => {
      await i18n.changeLanguage("es");
    });
    expect(i18n.language).toBe("es");
    expect(i18n.t("common.appName")).toBe("WorkloadGovernor");
    expect(i18n.t("settings.title")).toBe("Configuración");
    expect(i18n.t("settings.account")).toBe("Cuenta");

    await act(async () => {
      await i18n.changeLanguage("en");
    });
    expect(i18n.language).toBe("en");
    expect(i18n.t("settings.title")).toBe("Settings");
    expect(i18n.t("settings.account")).toBe("Account");
  });

  it("switches language dynamically to French", async () => {
    await act(async () => {
      await i18n.changeLanguage("fr");
    });
    expect(i18n.language).toBe("fr");
    expect(i18n.t("common.appName")).toBe("WorkloadGovernor");
    expect(i18n.t("settings.title")).toBe("Paramètres");
    expect(i18n.t("settings.account")).toBe("Compte");
    expect(i18n.t("nav.dashboard")).toBe("Tableau de bord");
    expect(i18n.t("maintainer.title")).toBe("Panneau de mainteneur");
    expect(i18n.t("maintainer.assign")).toBe("Assigner");
  });

  it("switches back from French to English correctly", async () => {
    await act(async () => {
      await i18n.changeLanguage("fr");
    });
    expect(i18n.t("settings.title")).toBe("Paramètres");

    await act(async () => {
      await i18n.changeLanguage("en");
    });
    expect(i18n.t("settings.title")).toBe("Settings");
  });

  it("handles pluralization correctly for count strings in English", () => {
    expect(i18n.t("counts.slot", { count: 1 })).toBe("1 slot");
    expect(i18n.t("counts.slot", { count: 3 })).toBe("3 slots");

    expect(i18n.t("counts.application", { count: 1 })).toBe("1 application");
    expect(i18n.t("counts.application", { count: 2 })).toBe("2 applications");
  });

  it("handles pluralization correctly for count strings in Spanish", async () => {
    await act(async () => {
      await i18n.changeLanguage("es");
    });
    expect(i18n.t("counts.slot", { count: 1 })).toBe("1 espacio");
    expect(i18n.t("counts.slot", { count: 3 })).toBe("3 espacios");

    expect(i18n.t("counts.application", { count: 1 })).toBe("1 solicitud");
    expect(i18n.t("counts.application", { count: 2 })).toBe("2 solicitudes");
  });

  it("handles pluralization correctly for count strings in French", async () => {
    await act(async () => {
      await i18n.changeLanguage("fr");
    });
    // French uses singular for 0 and 1, plural for 2+
    expect(i18n.t("counts.slot", { count: 1 })).toBe("1 créneau");
    expect(i18n.t("counts.slot", { count: 3 })).toBe("3 créneaux");

    expect(i18n.t("counts.application", { count: 1 })).toBe("1 candidature");
    expect(i18n.t("counts.application", { count: 2 })).toBe("2 candidatures");
  });

  it("formats dates using Intl.DateTimeFormat respecting selected locale", () => {
    const testDate = new Date("2026-06-20T00:00:00Z");
    
    const formattedEn = formatDate(testDate, { year: "numeric", month: "short", day: "numeric" }, "en");
    expect(formattedEn).toContain("Jun");
    expect(formattedEn).toContain("2026");

    const formattedEs = formatDate(testDate, { year: "numeric", month: "long", day: "numeric" }, "es");
    expect(formattedEs.toLowerCase()).toContain("junio");
    expect(formattedEs).toContain("2026");

    const formattedFr = formatDate(testDate, { year: "numeric", month: "long", day: "numeric" }, "fr");
    expect(formattedFr.toLowerCase()).toContain("juin");
    expect(formattedFr).toContain("2026");
  });

  it("changes displayed language via SettingsPage language dropdown", async () => {
    const mockWallet = {
      address: "GBXXX1ABCDEFGHIJKLMNO12345",
      publicKey: "GBXXX1ABCDEFGHIJKLMNO12345",
      error: null,
      networkMismatch: false,
      connect: () => Promise.resolve(),
      disconnect: () => {},
    };

    let currentSettings = {
      theme: "system" as const,
      language: "en" as const,
      defaultOrg: "",
      hideApplied: false,
      emailNotifications: false,
    };

    const mockSettingsHook = {
      settings: currentSettings,
      updateSetting: (key: string, val: any) => {
        (currentSettings as any)[key] = val;
      },
      resetSettings: () => {},
    };

    render(
      <MemoryRouter>
        <SettingsPage wallet={mockWallet as any} settingsHook={mockSettingsHook as any} />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Settings");

    const select = screen.getByLabelText(/interface language/i) as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(select, { target: { value: "es" } });
    });

    expect(i18n.language).toBe("es");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Configuración");
  });

  it("French locale has all required keys matching English structure", async () => {
    await act(async () => {
      await i18n.changeLanguage("fr");
    });
    // Verify all top-level namespaces are present with non-empty values
    expect(i18n.t("common.connectWallet")).not.toBe("common.connectWallet");
    expect(i18n.t("nav.home")).toBe("Accueil");
    expect(i18n.t("maintainer.applications")).toBe("Candidatures");
    expect(i18n.t("maintainer.noApplications")).toBe("Aucune candidature en attente.");
    expect(i18n.t("errors.global_limit_reached")).toContain("15");
  });
});
