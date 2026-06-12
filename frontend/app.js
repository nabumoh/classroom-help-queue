const API_BASE_URL = window.API_BASE_URL || "https://replace-with-api-id.execute-api.region.amazonaws.com/prod";

const form = document.getElementById("ticket-form");
const formMessage = document.getElementById("form-message");
const ticketsList = document.getElementById("tickets");
const emptyState = document.getElementById("empty-state");
const refreshBtn = document.getElementById("refresh-btn");
const adminPinInput = document.getElementById("adminPin");

const statusOptions = ["open", "in_progress", "done"];

const setFormMessage = (text, isError = false) => {
  formMessage.textContent = text;
  formMessage.className = isError ? "message error" : "message";
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

const fetchTickets = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/tickets`);
    if (!res.ok) {
      throw new Error("Failed to fetch tickets");
    }

    const data = await res.json();
    ticketsList.innerHTML = "";

    if (!data.items?.length) {
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";
    data.items.forEach((item) => ticketsList.appendChild(ticketItem(item)));
  } catch (error) {
    emptyState.style.display = "block";
    emptyState.textContent = error.message;
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
    const res = await fetch(`${API_BASE_URL}/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to create ticket");
    }

    form.reset();
    setFormMessage("Ticket created successfully.");
    await fetchTickets();
  } catch (error) {
    setFormMessage(error.message, true);
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

  const headers = { "Content-Type": "application/json" };
  if (adminPinInput.value.trim()) {
    headers["x-admin-pin"] = adminPinInput.value.trim();
  }

  try {
    const res = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to update status");
    }

    await fetchTickets();
  } catch (error) {
    emptyState.style.display = "block";
    emptyState.textContent = error.message;
  }
});

refreshBtn.addEventListener("click", fetchTickets);

fetchTickets();
