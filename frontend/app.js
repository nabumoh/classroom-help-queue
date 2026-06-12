const API_BASE_URL = window.API_BASE_URL || "https://replace-with-api-id.execute-api.region.amazonaws.com/prod";

const form = document.getElementById("ticket-form");
const formMessage = document.getElementById("form-message");
const ticketsList = document.getElementById("tickets");
const emptyState = document.getElementById("empty-state");
const refreshBtn = document.getElementById("refresh-btn");
const adminPinInput = document.getElementById("adminPin");

const statusOptions = ["open", "in_progress", "done"];
const LOCAL_STORAGE_KEY = "classroom-help-queue:tickets";
const PLACEHOLDER_API_TOKEN = "replace-with-api-id.execute-api.region.amazonaws.com";

const setFormMessage = (text, isError = false) => {
  formMessage.textContent = text;
  formMessage.className = isError ? "message error" : "message";
};

const isBackendConfigured = !API_BASE_URL.includes(PLACEHOLDER_API_TOKEN);

const readLocalTickets = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeLocalTickets = (items) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
};

const localApi = {
  list() {
    return { items: readLocalTickets() };
  },
  create(payload) {
    const tickets = readLocalTickets();
    const next = {
      ticketId: (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()),
      studentName: payload.studentName,
      topic: payload.topic,
      description: payload.description,
      urgency: payload.urgency,
      status: "open",
      createdAt: new Date().toISOString()
    };
    tickets.unshift(next);
    writeLocalTickets(tickets);
    return next;
  },
  update(ticketId, status) {
    const tickets = readLocalTickets();
    const idx = tickets.findIndex((t) => t.ticketId === ticketId);
    if (idx === -1) {
      throw new Error("Ticket not found");
    }
    tickets[idx] = { ...tickets[idx], status };
    writeLocalTickets(tickets);
    return tickets[idx];
  }
};

const ticketItem = (ticket) => {
  const li = document.createElement("li");
  li.className = "ticket";

  const options = statusOptions
    .map(
      (status) =>
        `<option value="${status}" ${ticket.status === status ? "selected" : ""}>${status}</option>`
    )
    .join("");

  li.innerHTML = `
    <header>
      <strong>${ticket.topic}</strong>
      <span class="status">${ticket.status.replace("_", " ")}</span>
    </header>
    <div class="meta">${ticket.studentName} | urgency: ${ticket.urgency} | ${new Date(ticket.createdAt).toLocaleString()}</div>
    <div>${ticket.description || "No description"}</div>
    <div class="status-row">
      <select data-ticket-id="${ticket.ticketId}">${options}</select>
      <button data-update-ticket-id="${ticket.ticketId}">Update Status</button>
    </div>
  `;

  return li;
};

const fetchRemoteJson = async (url, options) => {
  const res = await fetch(url, options);
  if (!res.ok) {
    let message = "Request failed";
    try {
      const err = await res.json();
      message = err.message || message;
    } catch {
      // Keep default message when response is not JSON.
    }
    throw new Error(message);
  }
  return res.json();
};

const fetchTickets = async () => {
  try {
    const data = isBackendConfigured
      ? await fetchRemoteJson(`${API_BASE_URL}/tickets`)
      : localApi.list();

    ticketsList.innerHTML = "";
    if (!data.items?.length) {
      emptyState.style.display = "block";
      emptyState.textContent = "No tickets yet.";
      return;
    }

    emptyState.style.display = "none";
    data.items.forEach((item) => ticketsList.appendChild(ticketItem(item)));

    if (!isBackendConfigured) {
      setFormMessage("Running in local mode until backend API is configured.");
    }
  } catch (error) {
    // Fall back to local mode when backend is unreachable.
    const data = localApi.list();
    ticketsList.innerHTML = "";
    if (!data.items?.length) {
      emptyState.style.display = "block";
      emptyState.textContent = "No tickets yet.";
    } else {
      emptyState.style.display = "none";
      data.items.forEach((item) => ticketsList.appendChild(ticketItem(item)));
    }
    setFormMessage("Backend unreachable. Running in local mode.", true);
  }
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setFormMessage("Submitting...");

  const payload = {
    studentName: document.getElementById("studentName").value.trim(),
    topic: document.getElementById("topic").value.trim(),
    description: document.getElementById("description").value.trim(),
    urgency: document.getElementById("urgency").value
  };

  try {
    if (isBackendConfigured) {
      await fetchRemoteJson(`${API_BASE_URL}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setFormMessage("Ticket created successfully.");
    } else {
      localApi.create(payload);
      setFormMessage("Ticket saved locally.");
    }

    form.reset();
    await fetchTickets();
  } catch (error) {
    localApi.create(payload);
    setFormMessage("Backend unavailable. Ticket saved locally.", true);
    form.reset();
    await fetchTickets();
  }
});

ticketsList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-update-ticket-id]");
  if (!button) {
    return;
  }

  const ticketId = button.getAttribute("data-update-ticket-id");
  const select = ticketsList.querySelector(`select[data-ticket-id="${ticketId}"]`);
  const status = select?.value;
  if (!status) {
    return;
  }

  try {
    if (isBackendConfigured) {
      const headers = { "Content-Type": "application/json" };
      if (adminPinInput.value.trim()) {
        headers["x-admin-pin"] = adminPinInput.value.trim();
      }

      await fetchRemoteJson(`${API_BASE_URL}/tickets/${ticketId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status })
      });
    } else {
      localApi.update(ticketId, status);
    }

    await fetchTickets();
  } catch (error) {
    localApi.update(ticketId, status);
    await fetchTickets();
    setFormMessage("Backend unavailable. Status updated locally.", true);
  }
});

refreshBtn.addEventListener("click", fetchTickets);

fetchTickets();
