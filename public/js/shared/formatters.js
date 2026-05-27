(function () {
  const namespace = window.LongtailForge || {};
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  function currency(amount) {
    return currencyFormatter.format(Number(amount) || 0);
  }

  function hours(seconds) {
    return `${((Number(seconds) || 0) / 3600).toFixed(2)} hrs`;
  }

  function monthLabel(date) {
    return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getFullYear()).slice(-2)}`;
  }

  function dateInput(date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  }

  function entryStatus(status) {
    return {
      unbilled: "Unbilled",
      billed: "Billed",
      paid: "Paid",
      na: "N/A",
    }[status] || "Unbilled";
  }

  function name(value, fallback = "") {
    return String(value || "").trim() || fallback;
  }

  namespace.formatters = {
    currency,
    hours,
    monthLabel,
    dateInput,
    entryStatus,
    name,
  };
  window.LongtailForge = namespace;
}());
