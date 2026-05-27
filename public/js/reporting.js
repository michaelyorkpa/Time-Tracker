// Reporting combines settings, client/project data, and time entries into billable totals.
const reportPeriodSelect = document.querySelector("[data-report-period]");
const reportCustomDates = document.querySelector("[data-report-custom-dates]");
const reportStartDateInput = document.querySelector("[data-report-start-date]");
const reportEndDateInput = document.querySelector("[data-report-end-date]");
const reportClientSelect = document.querySelector("[data-report-client]");
const reportProjectSelect = document.querySelector("[data-report-projects]");
const reportStatus = document.querySelector("[data-report-status]");
const reportTableWrap = document.querySelector("[data-report-table-wrap]");
const reportTableBody = document.querySelector("[data-report-table-body]");
const reportTotalTime = document.querySelector("[data-report-total-time]");
const reportTotalBillableAmount = document.querySelector(
  "[data-report-total-billable-amount]",
);

let reportClients = [];
let reportEntries = [];
let reportSettings = {
  defaultBillingRate: 0,
  billingPeriod: { type: "calendarMonth", startDay: 1 },
  billingRounding: { enabled: false, increment: "nearestQuarterHour" },
};

setDefaultCustomDates();
updateCustomDateState();
loadReportData();

reportPeriodSelect.addEventListener("change", () => {
  updateCustomDateState();
  renderReport();
});
reportStartDateInput.addEventListener("change", renderReport);
reportEndDateInput.addEventListener("change", renderReport);

reportClientSelect.addEventListener("change", () => {
  renderProjectFilter();
  renderReport();
});

reportProjectSelect.addEventListener("change", renderReport);

async function loadReportData() {
  setReportStatus("Loading report data...");

  try {
    const [settingsResponse, clientsResponse, entriesResponse] = await Promise.all([
      fetch("/api/settings", { cache: "no-store" }),
      fetch("/api/client-projects", { cache: "no-store" }),
      fetch("/api/time-entries", { cache: "no-store" }),
    ]);

    if (!clientsResponse.ok) {
      throw new Error(`Could not load client data: ${clientsResponse.status}`);
    }

    reportSettings = settingsResponse.ok
      ? normalizeSettings(await settingsResponse.json())
      : normalizeSettings({});
    reportClients = normalizeClients(await clientsResponse.json());
    reportEntries = entriesResponse.ok
      ? normalizeTimeEntries(await entriesResponse.json())
      : [];

    renderClientFilter();
    applyReportQueryParams();
    setReportStatus("");
  } catch (error) {
    setReportStatus("Report data could not be loaded.");
    console.error(error);
  }
}

function applyReportQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const clientId = params.get("client");

  if (!clientId || !reportClients.some((client) => client.id === clientId)) {
    return;
  }

  reportClientSelect.value = clientId;
  renderProjectFilter();
  renderReport();
}

function renderClientFilter() {
  reportClientSelect.replaceChildren(createOption("", "Select a client"));

  sortByName(reportClients).forEach((client) => {
    reportClientSelect.appendChild(createOption(client.id, client.name));
  });
}

function renderProjectFilter() {
  const client = getSelectedClient();
  reportProjectSelect.replaceChildren();
  reportProjectSelect.disabled = !client;

  if (!client) {
    return;
  }

  sortByName(getReportProjects(client)).forEach((project) => {
    const option = createOption(project.id, project.name);
    option.selected = true;
    reportProjectSelect.appendChild(option);
  });
}

function renderReport() {
  // This render path is intentionally derived from the current controls each time.
  const client = getSelectedClient();
  reportTableBody.innerHTML = "";
  reportTableWrap.hidden = true;

  if (!client) {
    setReportStatus("");
    return;
  }

  const selectedProjectIds = getSelectedProjectIds();
  const projects = sortByName(getReportProjects(client)).filter((project) =>
    selectedProjectIds.includes(project.id),
  );

  if (projects.length === 0) {
    setReportStatus("Select at least one project.");
    return;
  }

  const clientEntries = reportEntries.filter((entry) => matchesClient(entry, client));
  let totalSeconds = 0;
  let totalBillableAmount = 0;

  projects.forEach((project) => {
    const range = getSelectedDateRange(client, project);
    const projectEntries = clientEntries
      .filter((entry) =>
        matchesProject(entry, project) &&
        isEntryInRange(entry, range),
      );
    const projectSeconds = projectEntries
      .reduce((seconds, entry) => seconds + entry.durationSeconds, 0);
    const projectBillableSeconds = projectEntries
      .filter((entry) => entry.billable === "yes")
      .reduce((seconds, entry) => seconds + entry.durationSeconds, 0);

    if (projectSeconds === 0) {
      return;
    }

    const projectRounding = getEffectiveProjectBillingRounding(client, project);
    const roundedBillableSeconds = roundSeconds(projectBillableSeconds, projectRounding);
    const displaySeconds = projectBillableSeconds > 0
      ? roundedBillableSeconds
      : roundSeconds(projectSeconds, projectRounding);
    const rate = getProjectBillingRate(client, project);
    const billableAmount = (roundedBillableSeconds / 3600) * rate;

    totalSeconds += displaySeconds;
    totalBillableAmount += billableAmount;
    reportTableBody.appendChild(createReportRow(
      project,
      rate,
      displaySeconds,
      roundedBillableSeconds,
      billableAmount,
    ));
  });

  if (reportPeriodSelect.value === "custom" && !getCustomDateRange()) {
    setReportStatus("Choose a valid custom start and end date.");
    return;
  }

  if (!reportTableBody.children.length) {
    setReportStatus("No time entries match these filters.");
    return;
  }

  reportTotalTime.textContent = formatHours(totalSeconds);
  reportTotalBillableAmount.textContent = formatCurrency(totalBillableAmount);
  reportTableWrap.hidden = false;
  setReportStatus("");
}

function createReportRow(project, rate, seconds, billableSeconds, billableAmount) {
  const hasBillableTime = billableSeconds > 0;
  const row = document.createElement("tr");
  row.append(
    createTableCell(project.name, "th"),
    createTableCell(hasBillableTime ? formatRate(rate) : ""),
    createTableCell(formatHours(seconds)),
    createTableCell(hasBillableTime ? formatCurrency(billableAmount) : ""),
  );
  row.firstElementChild.scope = "row";
  return row;
}

function normalizeClients(data) {
  // Inactive clients are hidden from reports, but historic entry projects can still be added below.
  return Array.isArray(data?.clients)
    ? data.clients
        .filter((client) => client.status !== "Inactive")
        .map((client) => ({
          id: String(client.id || "").trim(),
          name: String(client.name || "").trim(),
          billable: normalizeBillableFlag(client.billable),
          billingRate: parseOptionalMoney(client.billing_rate),
          billingPeriod: normalizeOptionalBillingPeriod(client.billing_period),
          billingRounding: normalizeOptionalBillingRounding(client.billing_rounding),
          projects: Array.isArray(client.projects)
            ? client.projects.map((project) => ({
                id: String(project.id || "").trim(),
                name: String(project.name || "").trim(),
                billable: normalizeBillableFlag(project.billable, client.billable),
                billingRate: parseOptionalMoney(project.billing_rate),
                billingPeriod: normalizeOptionalBillingPeriod(project.billing_period),
                billingRounding: normalizeOptionalBillingRounding(project.billing_rounding),
              }))
            : [],
        }))
    : [];
}

function normalizeTimeEntries(data) {
  return Array.isArray(data?.entries)
    ? data.entries.map((entry) => ({
        clientId: entry.client_id,
        clientName: entry.client_name,
        projectId: entry.project_id,
        projectName: entry.project_name,
        endTime: new Date(entry.end_time),
        durationSeconds: Number(entry.duration_seconds) || 0,
        billable: entry.billable === "no" ? "no" : "yes",
      }))
    : [];
}

function getSelectedClient() {
  return reportClients.find((client) => client.id === reportClientSelect.value);
}

function getSelectedProjectIds() {
  return [...reportProjectSelect.selectedOptions].map((option) => option.value);
}

function getReportProjects(client) {
  // Include projects found only in historic entries so older time remains reportable.
  const projectsByKey = new Map();

  client.projects.forEach((project) => {
    projectsByKey.set(getProjectMatchKey(project), project);
  });

  reportEntries
    .filter((entry) => matchesClient(entry, client))
    .forEach((entry) => {
      const project = {
        id: entry.projectId || normalizeKey(entry.projectName),
        name: entry.projectName || entry.projectId || "Untitled Project",
        billingRate: null,
        billingPeriod: null,
        billingRounding: null,
        billable: client.billable,
      };
      const key = getProjectMatchKey(project);

      if (!projectsByKey.has(key)) {
        projectsByKey.set(key, project);
      }
    });

  return [...projectsByKey.values()];
}

function getProjectBillingRate(client, project) {
  return project.billingRate ?? client.billingRate ?? reportSettings.defaultBillingRate;
}

function getSelectedDateRange(client, project) {
  if (reportPeriodSelect.value === "custom") {
    return getCustomDateRange();
  }

  const billingPeriod = getEffectiveProjectBillingPeriod(client, project);
  return getBillingPeriodRange(billingPeriod, reportPeriodSelect.value);
}

function getCustomDateRange() {
  const startDate = parseDateInput(reportStartDateInput.value);
  const endDate = parseDateInput(reportEndDateInput.value);

  if (!startDate || !endDate || startDate > endDate) {
    return null;
  }

  const exclusiveEndDate = new Date(endDate);
  // Make the end date inclusive for the user by using an exclusive midnight boundary.
  exclusiveEndDate.setDate(exclusiveEndDate.getDate() + 1);
  return { start: startDate, end: exclusiveEndDate };
}

function getBillingPeriodRange(period, mode) {
  return window.LongtailForge.billing.getBillingPeriodRange(period, mode);
}

function isEntryInRange(entry, range) {
  return Boolean(
    range &&
    Number.isFinite(entry.endTime.getTime()) &&
    entry.endTime >= range.start &&
    entry.endTime < range.end,
  );
}

function getEffectiveClientBillingPeriod(client) {
  return client.billingPeriod || reportSettings.billingPeriod;
}

function getEffectiveProjectBillingPeriod(client, project) {
  return project.billingPeriod || getEffectiveClientBillingPeriod(client);
}

function getEffectiveClientBillingRounding(client) {
  return client.billingRounding || reportSettings.billingRounding;
}

function getEffectiveProjectBillingRounding(client, project) {
  return project.billingRounding || getEffectiveClientBillingRounding(client);
}

function matchesClient(entry, client) {
  return window.LongtailForge.records.matchesClient(entry, client);
}

function matchesProject(entry, project) {
  return window.LongtailForge.records.matchesProject(entry, project);
}

function getProjectMatchKey(project) {
  return window.LongtailForge.records.getProjectMatchKey(project);
}

function normalizeKey(value) {
  return window.LongtailForge.records.normalizeKey(value);
}

function parseMoney(value) {
  return window.LongtailForge.billing.parseMoney(value);
}

function parseOptionalMoney(value) {
  return window.LongtailForge.billing.parseOptionalMoney(value);
}

function normalizeBillableFlag(value, fallback = "yes") {
  return window.LongtailForge.billing.normalizeBillableFlag(value, fallback);
}

function normalizeSettings(settings) {
  return {
    defaultBillingRate: parseMoney(settings?.defaultBillingRate),
    billingPeriod: normalizeBillingPeriod(settings?.billingPeriod),
    billingRounding: normalizeBillingRounding(settings?.billingRounding),
  };
}

function normalizeBillingPeriod(period) {
  return window.LongtailForge.billing.normalizeBillingPeriod(period);
}

function normalizeOptionalBillingPeriod(period) {
  return window.LongtailForge.billing.normalizeOptionalBillingPeriod(period);
}

function normalizeBillingRounding(rounding) {
  return window.LongtailForge.billing.normalizeBillingRounding(rounding);
}

function normalizeOptionalBillingRounding(rounding) {
  return window.LongtailForge.billing.normalizeOptionalBillingRounding(rounding);
}

function roundSeconds(seconds, rounding) {
  return window.LongtailForge.billing.roundSeconds(seconds, rounding);
}

function updateCustomDateState() {
  const isCustom = reportPeriodSelect.value === "custom";
  reportCustomDates.hidden = !isCustom;
  reportStartDateInput.disabled = !isCustom;
  reportEndDateInput.disabled = !isCustom;
}

function setDefaultCustomDates() {
  const today = new Date();
  reportStartDateInput.value = formatDateInput(new Date(today.getFullYear(), today.getMonth(), 1));
  reportEndDateInput.value = formatDateInput(today);
}

function parseDateInput(value) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateInput(date) {
  return window.LongtailForge.formatters.dateInput(date);
}

function formatRate(rate) {
  return rate ? `${formatCurrency(rate)}/hr` : "$0.00/hr";
}

function formatHours(seconds) {
  return window.LongtailForge.formatters.hours(seconds);
}

function formatCurrency(amount) {
  return window.LongtailForge.formatters.currency(amount);
}

function createOption(value, text) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  return option;
}

function createTableCell(text, tagName = "td") {
  const cell = document.createElement(tagName);
  cell.textContent = text;
  return cell;
}

function sortByName(items) {
  return window.LongtailForge.records.sortByName(items);
}

function setReportStatus(message) {
  reportStatus.textContent = message;
}
