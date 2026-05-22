(function () {
  const themeCookie = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("lf_theme="));
  const cookieTheme = themeCookie
    ? decodeURIComponent(themeCookie.split("=").slice(1).join("="))
    : "";
  const storedTheme = window.localStorage.getItem("lf_theme") || "";
  const theme = cookieTheme || storedTheme;

  if (theme === "dark") {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.style.colorScheme = "dark";
    return;
  }

  document.documentElement.dataset.theme = "light";
  document.documentElement.style.colorScheme = "light";
})();
