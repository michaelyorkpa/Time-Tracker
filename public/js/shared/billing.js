(function () {
  const namespace = window.LongtailForge || {};
  const increments = ["nearestHour", "nearestHalfHour", "nearestQuarterHour"];

  function parseMoney(value) {
    const amount = Number(String(value || "").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(amount) ? amount : 0;
  }

  function parseOptionalMoney(value) {
    const text = String(value ?? "").trim();

    if (!text) {
      return null;
    }

    const amount = Number(text.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(amount) ? amount : null;
  }

  function normalizeBillableFlag(value, fallback = "yes") {
    if (value === false || value === "no") {
      return "no";
    }

    if (value === true || value === "yes") {
      return "yes";
    }

    return fallback === "no" ? "no" : "yes";
  }

  function normalizeBillingPeriod(period) {
    const type = period?.type === "custom" ? "custom" : "calendarMonth";
    const startDay = Math.min(28, Math.max(1, Number.parseInt(period?.startDay, 10) || 1));

    return {
      type,
      startDay: type === "custom" ? startDay : 1,
    };
  }

  function normalizeOptionalBillingPeriod(period) {
    if (!period || period.type === "inherit") {
      return null;
    }

    return normalizeBillingPeriod(period);
  }

  function normalizeBillingRounding(rounding) {
    const increment = increments.includes(rounding?.increment)
      ? rounding.increment
      : "nearestQuarterHour";

    return {
      enabled: Boolean(rounding?.enabled),
      increment,
    };
  }

  function normalizeOptionalBillingRounding(rounding) {
    if (!rounding || rounding.type === "inherit") {
      return null;
    }

    return normalizeBillingRounding(rounding);
  }

  function roundSeconds(seconds, rounding) {
    const normalizedRounding = normalizeBillingRounding(rounding);

    if (!normalizedRounding.enabled) {
      return seconds;
    }

    const incrementSeconds = {
      nearestHour: 3600,
      nearestHalfHour: 1800,
      nearestQuarterHour: 900,
    }[normalizedRounding.increment];

    return Math.round(seconds / incrementSeconds) * incrementSeconds;
  }

  function getBillingPeriodRange(period, mode, today = new Date()) {
    const normalizedPeriod = normalizeBillingPeriod(period);
    let start;

    if (normalizedPeriod.type === "custom") {
      start = getCurrentCustomPeriodStart(today, normalizedPeriod.startDay);
    } else {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    if (mode === "last") {
      start = addMonths(start, -1);
    }

    return {
      start,
      end: addMonths(start, 1),
    };
  }

  function getCurrentCustomPeriodStart(date, startDay) {
    const currentMonthStart = new Date(date.getFullYear(), date.getMonth(), startDay);

    if (date >= currentMonthStart) {
      return currentMonthStart;
    }

    return new Date(date.getFullYear(), date.getMonth() - 1, startDay);
  }

  function addMonths(date, monthCount) {
    return new Date(date.getFullYear(), date.getMonth() + monthCount, date.getDate());
  }

  namespace.billing = {
    addMonths,
    getBillingPeriodRange,
    getCurrentCustomPeriodStart,
    normalizeBillableFlag,
    normalizeBillingPeriod,
    normalizeBillingRounding,
    normalizeOptionalBillingPeriod,
    normalizeOptionalBillingRounding,
    parseMoney,
    parseOptionalMoney,
    roundSeconds,
  };
  window.LongtailForge = namespace;
}());
