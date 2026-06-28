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
    const frame = {
      id: i,
      notes: "",
      photoTaken: false
    };
    frames.push(frame);

    const card = document.createElement("div");
    card.className = "frame-card";

    const header = document.createElement("div");
    header.className = "frame-header";

    const idSpan = document.createElement("span");
    idSpan.className = "frame-id";
    idSpan.textContent = `Frame ${i}`;

    const photoBtn = document.createElement("button");
    photoBtn.className = "photo-btn";
    photoBtn.textContent = "Mark Photo Taken";
    photoBtn.addEventListener("click", () => {
      frame.photoTaken = !frame.photoTaken;
      photoStatus.textContent = frame.photoTaken ? "Photo: ✔" : "Photo: ✖";
    });

    header.appendChild(idSpan);
    header.appendChild(photoBtn);

    const notesLabel = document.createElement("div");
    notesLabel.className = "notes-label";
    notesLabel.textContent = "Notes";

    const notesArea = document.createElement("textarea");
    notesArea.className = "frame-notes";
    notesArea.addEventListener("input", () => {
      frame.notes = notesArea.value;
    });

    const photoStatus = document.createElement("div");
    photoStatus.className = "photo-status";
    photoStatus.textContent = "Photo: ✖";

    card.appendChild(header);
    card.appendChild(notesLabel);
    card.appendChild(notesArea);
    card.appendChild(photoStatus);

    framesGrid.appendChild(card);
  }
}

function getKey() {
  const hiveId = hiveIdInput.value.trim() || "default-hive";
  const date = dateInput.value || "no-date";
  return `hivelog:${hiveId}:${date}`;
}

function saveInspection() {
  const key = getKey();
  const payload = {
    hiveId: hiveIdInput.value.trim(),
    date: dateInput.value,
    frames
  };
  localStorage.setItem(key, JSON.stringify(payload));
  statusSpan.textContent = `Saved inspection for ${payload.hiveId || "default"} on ${payload.date || "no date"}.`;
}

function loadInspection() {
  const key = getKey();
  const raw = localStorage.getItem(key);
  if (!raw) {
    statusSpan.textContent = "No saved inspection for this hive/date.";
    return;
  }
  const data = JSON.parse(raw);
  statusSpan.textContent = `Loaded inspection for ${data.hiveId || "default"} on ${data.date || "no date"}.`;

  initFrames();
  data.frames.forEach((savedFrame, idx) => {
    if (!frames[idx]) return;
    frames[idx].notes = savedFrame.notes;
    frames[idx].photoTaken = savedFrame.photoTaken;

    const card = framesGrid.children[idx];
    const notesArea = card.querySelector(".frame-notes");
    const photoStatus = card.querySelector(".photo-status");

    notesArea.value = savedFrame.notes || "";
    photoStatus.textContent = savedFrame.photoTaken ? "Photo: ✔" : "Photo: ✖";
  });
}

function newInspection() {
  initFrames();
  statusSpan.textContent = "New inspection started.";
}

saveBtn.addEventListener("click", saveInspection);
newInspectionBtn.addEventListener("click", newInspection);
loadInspectionBtn.addEventListener("click", loadInspection);

window.addEventListener("load", () => {
  initFrames();
  const today = new Date().toISOString().slice(0, 10);
  dateInput.value = today;
});
