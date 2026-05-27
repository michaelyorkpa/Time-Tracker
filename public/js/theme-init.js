(function () {
  const THEME_STORAGE_KEY = "lf_theme";

  const themeCookie = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${THEME_STORAGE_KEY}=`));
  const cookieTheme = themeCookie
    ? decodeURIComponent(themeCookie.split("=").slice(1).join("="))
    : "";
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) || "";
  const themeMode = normalizeThemeMode(cookieTheme || storedTheme);
  const theme = resolveThemeMode(themeMode);

  document.documentElement.dataset.themeMode = themeMode;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;

  function normalizeThemeMode(value) {
    return value === "dark" ? "dark" : "light";
  }

  function resolveThemeMode(value) {
    return normalizeThemeMode(value);
  }
})();
