const FRAME_COUNT = 10;

const hiveIdInput = document.getElementById("hiveId");
const dateInput = document.getElementById("inspectionDate");
const framesGrid = document.getElementById("framesGrid");
const saveBtn = document.getElementById("saveBtn");
const statusSpan = document.getElementById("status");
const newInspectionBtn = document.getElementById("newInspectionBtn");
const loadInspectionBtn = document.getElementById("loadInspectionBtn");

let frames = [];

function initFrames() {
  framesGrid.innerHTML = "";
  frames = [];

  for (let i = 1; i <= FRAME_COUNT; i++) {
    const frame = { id: i, notes: "", photoTaken: false };
    frames.push(frame);

    const card = document.createElement("div");
    card.className = "frame-card";

    const title = document.createElement("h3");
    title.textContent = `Frame ${i}`;

    const photoBtn = document.createElement("button");
    photoBtn.textContent = "Mark Photo Taken";
    photoBtn.addEventListener("click", () => {
      frame.photoTaken = !frame.photoTaken;
      status.textContent = frame.photoTaken ? "Photo: ✔" : "Photo: ✖";
    });

    const notes = document.createElement("textarea");
    notes.placeholder = "Notes...";
    notes.addEventListener("input", () => {
      frame.notes = notes.value;
    });

    const status = document.createElement("div");
    status.className = "photo-status";
    status.textContent = "Photo: ✖";

    card.appendChild(title);
    card.appendChild(photoBtn);
    card.appendChild(notes);
    card.appendChild(status);

    framesGrid.appendChild(card);
  }
}

function getKey() {
  return `hivelog:${hiveIdInput.value}:${dateInput.value}`;
}

function saveInspection() {
  localStorage.setItem(getKey(), JSON.stringify(frames));
  statusSpan.textContent = "Saved.";
}

function loadInspection() {
  const raw = localStorage.getItem(getKey());
  if (!raw) {
    statusSpan.textContent = "No saved inspection.";
    return;
  }
  const saved = JSON.parse(raw);
  initFrames();
  saved.forEach((f, i) => {
    frames[i] = f;
    const card = framesGrid.children[i];
    card.querySelector("textarea").value = f.notes;
    card.querySelector(".photo-status").textContent = f.photoTaken ? "Photo: ✔" : "Photo: ✖";
  });
  statusSpan.textContent = "Loaded.";
}

newInspectionBtn.addEventListener("click", initFrames);
loadInspectionBtn.addEventListener("click", loadInspection);
saveBtn.addEventListener("click", saveInspection);

window.onload = initFrames;
