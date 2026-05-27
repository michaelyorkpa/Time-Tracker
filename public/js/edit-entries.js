// Edit Entries reuses the reporting data sources, then writes changes back by entry ID.
const filterClientSelect = document.querySelector("[data-edit-filter-client]");
const filterProjectSelect = document.querySelector("[data-edit-filter-project]");
const filterStatusSelect = document.querySelector("[data-edit-filter-status]");
const filterPeriodSelect = document.querySelector("[data-edit-filter-period]");
const filterCustomDates = document.querySelector("[data-edit-filter-custom-dates]");
const filterStartDateInput = document.querySelector("[data-edit-filter-start-date]");
const filterEndDateInput = document.querySelector("[data-edit-filter-end-date]");
const filterUsersSelect = document.querySelector("[data-edit-filter-users]");
const editEntryStatus = document.querySelector("[data-edit-entry-status]");
const editEntryTable = document.querySelector("[data-edit-entry-table]");
const editEntryForm = document.querySelector("[data-edit-entry-form]");
const editEntryHeading = document.querySelector("[data-edit-entry-heading]");
const editEntryClientSelect = document.querySelector("[data-edit-entry-client]");
const editEntryProjectSelect = document.querySelector("[data-edit-entry-project]");
const editEntryDateInput = document.querySelector("[data-edit-entry-date]");
const editEntryStartTimeInput = document.querySelector("[data-edit-entry-start-time]");
const editEntryEndTimeInput = document.querySelector("[data-edit-entry-end-time]");
const editEntryDescriptionInput = document.querySelector("[data-edit-entry-description]");
const editEntryBillableSelect = document.querySelector("[data-edit-entry-billable]");
const editEntryInvoiceStatusSelect = document.querySelector("[data-edit-entry-invoice-status]");
const cancelEditEntryButton = document.querySelector("[data-cancel-edit-entry]");
const saveEditEntryButton = document.querySelector("[data-save-edit-entry]");

let editClients = [];
let editSettings = {
  billingPeriod: { type: "calendarMonth", startDay: 1 },
};
let timeEntries = [];
let editUsers = [];
let selectedEntryId = "";

loadEditEntryData();

filterStatusSelect.addEventListener("change", renderEntries);
filterPeriodSelect.addEventListener("change", () => {
  updateFilterDateState();
  renderEntries();
});
filterStartDateInput.addEventListener("change", renderEntries);
filterEndDateInput.addEventListener("change", renderEntries);
filterUsersSelect.addEventListener("change", renderEntries);
filterClientSelect.addEventListener("change", () => {
  populateFilterProjects();
  renderEntries();
});
filterProjectSelect.addEventListener("change", renderEntries);
editEntryClientSelect.addEventListener("change", () => {
  populateEditProjects();
});
cancelEditEntryButton.addEventListener("click", closeEditForm);
editEntryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await saveEditedEntry();
});

async function loadEditEntryData() {
  setEditEntryStatus("Loading entries...");

  try {
    const [settingsResponse, clientsResponse, entriesResponse, usersResponse] = await Promise.all([
      fetch("/api/settings", { cache: "no-store" }),
      fetch("/api/client-projects", { cache: "no-store" }),
      fetch("/api/time-entries", { cache: "no-store" }),
      fetch("/api/users", { cache: "no-store" }),
    ]);

    if (!clientsResponse.ok) {
      throw new Error(`Could not load client data: ${clientsResponse.status}`);
    }

    editSettings = settingsResponse.ok
      ? normalizeSettings(await settingsResponse.json())
      : normalizeSettings({});
    editClients = normalizeClients(await clientsResponse.json());
    timeEntries = entriesResponse.ok
      ? normalizeTimeEntries(await entriesResponse.json())
      : [];
    editUsers = usersResponse.ok
      ? normalizeUsers(await usersResponse.json())
      : [];

    populateClientOptions(filterClientSelect, "All clients");
    populateClientOptions(editEntryClientSelect, "Select a client");
    populateUserOptions();
    setDefaultCustomDates();
    updateFilterDateState();
    renderEntries();
    setEditEntryStatus("");
  } catch (error) {
    setEditEntryStatus("Entries could not be loaded.");
    console.error(error);
  }
}

function populateClientOptions(select, placeholder) {
  select.replaceChildren(createOption("", placeholder));

  sortByName(editClients).forEach((client) => {
    select.appendChild(createOption(client.id, client.name));
  });
}

function populateFilterProjects() {
  const client = getClient(filterClientSelect.value);
  filterProjectSelect.replaceChildren(createOption("", "All projects"));
  filterProjectSelect.disabled = !client;

  if (!client) {
    return;
  }

  sortByName(client.projects).forEach((project) => {
    filterProjectSelect.appendChild(createOption(project.id, project.name));
  });
}

function populateEditProjects(projectId = "") {
  const client = getClient(editEntryClientSelect.value);
  editEntryProjectSelect.replaceChildren(createOption("", "Select a project"));
  editEntryProjectSelect.disabled = !client;

  if (!client) {
    return;
  }

  sortByName(client.projects).forEach((project) => {
    editEntryProjectSelect.appendChild(createOption(project.id, project.name));
  });

  editEntryProjectSelect.value = projectId;
}

function renderEntries() {
  // The table is rebuilt from state after every filter change or save.
  editEntryTable.innerHTML = "";
  const entries = getFilteredEntries();

  if (!entries.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.textContent = "No entries match these filters.";
    row.appendChild(cell);
    editEntryTable.appendChild(row);
    return;
  }

  entries.forEach((entry) => {
    const row = document.createElement("tr");
    row.append(
      createTableCell(formatDate(entry.endTime)),
      createTableCell(entry.clientName),
      createTableCell(entry.projectName),
      createTableCell(formatHours(entry.durationSeconds)),
      createTableCell(formatInvoiceStatus(entry.invoiceStatus)),
      createActionsCell(entry),
    );
    editEntryTable.appendChild(row);
  });
}

function getFilteredEntries() {
  const selectedUsers = getSelectedUserIds();
  const selectedDateRange = getSelectedDateRange();

  return timeEntries
    .filter((entry) => matchesStatusFilter(entry))
    .filter((entry) => isEntryInRange(entry, selectedDateRange))
    .filter((entry) => selectedUsers.length === 0 || selectedUsers.includes(entry.userId))
    .filter((entry) => !filterClientSelect.value || matchesClient(entry, getClient(filterClientSelect.value)))
    .filter((entry) => !filterProjectSelect.value || matchesProject(entry, getProject(filterClientSelect.value, filterProjectSelect.value)))
    .sort((firstEntry, secondEntry) => secondEntry.endTime - firstEntry.endTime);
}

function createActionsCell(entry) {
  const cell = document.createElement("td");
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Edit";
  button.addEventListener("click", () => openEditForm(entry.entryId));
  cell.appendChild(button);
  return cell;
}

function openEditForm(entryId) {
  // Entries may have old client/project names, so IDs are resolved through helper matching.
  const entry = timeEntries.find((currentEntry) => currentEntry.entryId === entryId);

  if (!entry) {
    setEditEntryStatus("Entry could not be found.");
    return;
  }

  selectedEntryId = entry.entryId;
  editEntryHeading.textContent = `Edit Entry ${entry.entryId}`;
  editEntryClientSelect.value = findClientIdForEntry(entry);
  populateEditProjects(findProjectIdForEntry(entry));
  editEntryDateInput.value = formatDateInput(entry.startTime);
  editEntryStartTimeInput.value = formatTimeInput(entry.startTime);
  editEntryEndTimeInput.value = formatTimeInput(entry.endTime);
  editEntryDescriptionInput.value = entry.description;
  editEntryBillableSelect.value = entry.billable;
  editEntryInvoiceStatusSelect.value = entry.invoiceStatus;
  editEntryForm.hidden = false;
  editEntryForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function saveEditedEntry() {
  const client = getClient(editEntryClientSelect.value);
  const project = getProject(editEntryClientSelect.value, editEntryProjectSelect.value);
  const startTime = createLocalDateTime(editEntryDateInput.value, editEntryStartTimeInput.value);
  const endTime = createLocalDateTime(editEntryDateInput.value, editEntryEndTimeInput.value);

  // Keep client/project names in the saved entry so reports do not need extra joins.
  if (!client || !project) {
    setEditEntryStatus("Select a client and project.");
    return;
  }

  if (!startTime || !endTime || endTime <= startTime) {
    setEditEntryStatus("Enter a valid date and time range.");
    return;
  }

  const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
  const entry = {
    client_id: client.id,
    client_name: client.name,
    project_id: project.id,
    project_name: project.name,
    description: editEntryDescriptionInput.value.trim(),
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    duration_seconds: durationSeconds,
    duration_hours: (durationSeconds / 3600).toFixed(4),
    billable: editEntryBillableSelect.value,
    invoice_status: editEntryInvoiceStatusSelect.value,
  };

  saveEditEntryButton.disabled = true;
  setEditEntryStatus("Saving entry...");

  try {
    const response = await fetch(`/api/time-entries/${encodeURIComponent(selectedEntryId)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    });

    if (!response.ok) {
      throw new Error(`Could not save entry: ${response.status}`);
    }

    await loadEditEntryData();
    closeEditForm();
    flashSavedButton();
    setEditEntryStatus(`Saved ${selectedEntryId}.`);
  } catch (error) {
    setEditEntryStatus("Entry was not saved. Start the local server and try again.");
    console.error(error);
  } finally {
    saveEditEntryButton.disabled = false;
  }
}

function closeEditForm() {
  selectedEntryId = "";
  editEntryForm.hidden = true;
  editEntryForm.reset();
}

function normalizeClients(data) {
  return Array.isArray(data?.clients)
    ? data.clients.map((client) => ({
        id: String(client.id || "").trim(),
        name: String(client.name || "").trim(),
        projects: Array.isArray(client.projects)
          ? client.projects.map((project) => ({
              id: String(project.id || "").trim(),
              name: String(project.name || "").trim(),
            }))
          : [],
      }))
    : [];
}

function normalizeTimeEntries(data) {
  return Array.isArray(data?.entries)
    ? data.entries.map((entry) => ({
        entryId: entry.entry_id,
        userId: entry.user_id,
        clientId: entry.client_id,
        clientName: entry.client_name,
        projectId: entry.project_id,
        projectName: entry.project_name,
        description: entry.description,
        startTime: new Date(entry.start_time),
        endTime: new Date(entry.end_time),
        durationSeconds: Number(entry.duration_seconds) || 0,
        billable: entry.billable === "no" ? "no" : "yes",
        invoiceStatus: entry.invoice_status || "unbilled",
      }))
    : [];
}

function normalizeSettings(settings) {
  return {
    billingPeriod: normalizeBillingPeriod(settings?.billingPeriod),
  };
}

function normalizeUsers(data) {
  return Array.isArray(data?.users)
    ? data.users.map((user) => ({
        userId: String(user.user_id || "").trim(),
        username: String(user.username || "").trim(),
        userStatus: user.userStatus === "inactive" ? "inactive" : "active",
      }))
    : [];
}

function populateUserOptions() {
  const usersById = new Map();

  editUsers.forEach((user) => {
    usersById.set(user.userId, user.username || user.userId);
  });

  timeEntries.forEach((entry) => {
    if (entry.userId && !usersById.has(entry.userId)) {
      usersById.set(entry.userId, entry.userId);
    }
  });

  filterUsersSelect.replaceChildren();

  [...usersById.entries()]
    .sort((firstUser, secondUser) => firstUser[1].localeCompare(secondUser[1], undefined, {
      sensitivity: "base",
    }))
    .forEach(([userId, label]) => {
      filterUsersSelect.appendChild(createOption(userId, label));
    });
}

function getSelectedUserIds() {
  return [...filterUsersSelect.selectedOptions].map((option) => option.value);
}

function matchesStatusFilter(entry) {
  return !filterStatusSelect.value || entry.invoiceStatus === filterStatusSelect.value;
}

function getSelectedDateRange() {
  if (filterPeriodSelect.value === "all") {
    return null;
  }

  if (filterPeriodSelect.value === "custom") {
    return getCustomDateRange();
  }

  return getBillingPeriodRange(editSettings.billingPeriod, filterPeriodSelect.value);
}

function getCustomDateRange() {
  const startDate = parseDateInput(filterStartDateInput.value);
  const endDate = parseDateInput(filterEndDateInput.value);

  if (!startDate || !endDate || startDate > endDate) {
    return { invalid: true };
  }

  const exclusiveEndDate = new Date(endDate);
  exclusiveEndDate.setDate(exclusiveEndDate.getDate() + 1);
  return { start: startDate, end: exclusiveEndDate };
}

function getBillingPeriodRange(period, mode) {
  const today = new Date();
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

function isEntryInRange(entry, range) {
  if (range?.invalid) {
    return false;
  }

  return Boolean(
    !range ||
    (Number.isFinite(entry.endTime.getTime()) &&
      entry.endTime >= range.start &&
      entry.endTime < range.end)
  );
}

function normalizeBillingPeriod(period) {
  const type = period?.type === "custom" ? "custom" : "calendarMonth";
  const startDay = Math.min(28, Math.max(1, Number.parseInt(period?.startDay, 10) || 1));

  return {
    type,
    startDay: type === "custom" ? startDay : 1,
  };
}

function getClient(clientId) {
  return editClients.find((client) => client.id === clientId);
}

function getProject(clientId, projectId) {
  return getClient(clientId)?.projects.find((project) => project.id === projectId);
}

function findClientIdForEntry(entry) {
  return editClients.find((client) => matchesClient(entry, client))?.id || "";
}

function findProjectIdForEntry(entry) {
  const client = getClient(editEntryClientSelect.value);
  return client?.projects.find((project) => matchesProject(entry, project))?.id || "";
}

function matchesClient(entry, client) {
  return normalizeKey(entry.clientId) === normalizeKey(client?.id) ||
    normalizeKey(entry.clientName) === normalizeKey(client?.name);
}

function matchesProject(entry, project) {
  return normalizeKey(entry.projectId) === normalizeKey(project?.id) ||
    normalizeKey(entry.projectName) === normalizeKey(project?.name);
}

function createLocalDateTime(dateValue, timeValue) {
  // Build local dates manually so editing does not shift times through UTC parsing.
  if (!dateValue || !timeValue) {
    return null;
  }

  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours, minutes] = timeValue.split(":").map(Number);
  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);

  return Number.isFinite(date.getTime()) ? date : null;
}

function parseDateInput(value) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return Number.isFinite(date.getTime()) ? date : null;
}

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function formatDate(date) {
  return Number.isFinite(date.getTime())
    ? date.toLocaleDateString()
    : "";
}

function formatHours(seconds) {
  return `${(seconds / 3600).toFixed(2)} hrs`;
}

function formatInvoiceStatus(status) {
  return {
    unbilled: "Unbilled",
    billed: "Billed",
    paid: "Paid",
  }[status] || "Unbilled";
}

function formatDateInput(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatTimeInput(date) {
  return [
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
  ].join(":");
}

function setDefaultCustomDates() {
  const today = new Date();
  filterStartDateInput.value = formatDateInput(new Date(today.getFullYear(), today.getMonth(), 1));
  filterEndDateInput.value = formatDateInput(today);
}

function updateFilterDateState() {
  const isCustom = filterPeriodSelect.value === "custom";
  filterCustomDates.hidden = !isCustom;
  filterStartDateInput.disabled = !isCustom;
  filterEndDateInput.disabled = !isCustom;
}

function flashSavedButton() {
  const originalText = saveEditEntryButton.textContent;
  saveEditEntryButton.textContent = "Saved.";
  saveEditEntryButton.classList.add("is-saved");

  window.setTimeout(() => {
    saveEditEntryButton.textContent = originalText;
    saveEditEntryButton.classList.remove("is-saved");
  }, 1600);
}

function createOption(value, text) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  return option;
}

function createTableCell(text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

function sortByName(items) {
  return [...items].sort((firstItem, secondItem) =>
    firstItem.name.localeCompare(secondItem.name, undefined, {
      sensitivity: "base",
    }),
  );
}

function setEditEntryStatus(message) {
  editEntryStatus.textContent = message;
}
