// Simple localStorage-backed model: hives -> boxes -> frames

const STORAGE_KEY = "hivelog2-data";

let state = {
  hives: [],
  currentHiveId: null,
  currentBoxId: null,
  currentFrameId: null,
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load state", e);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createHive(name) {
  const id = `hive-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const hive = { id, name, boxes: [] };
  state.hives.push(hive);
  state.currentHiveId = id;
  state.currentBoxId = null;
  saveState();
  render();
}

function createBox(hiveId, boxName, frameCount) {
  const hive = state.hives.find(h => h.id === hiveId);
  if (!hive) return;
  const id = `box-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const frames = [];
  for (let i = 1; i <= frameCount; i++) {
    frames.push({
      id: `frame-${i}`,
      index: i,
      status: "",
      notes: "",
      photoUrl: "",
    });
  }
  hive.boxes.push({ id, name: boxName || `Box ${hive.boxes.length + 1}`, frames });
  state.currentBoxId = id;
  saveState();
  render();
}

function getCurrentHive() {
  return state.hives.find(h => h.id === state.currentHiveId) || null;
}

function getCurrentBox() {
  const hive = getCurrentHive();
  if (!hive) return null;
  return hive.boxes.find(b => b.id === state.currentBoxId) || null;
}

function getCurrentFrame() {
  const box = getCurrentBox();
  if (!box) return null;
  return box.frames.find(f => f.id === state.currentFrameId) || null;
}

// DOM refs
const hiveListEl = document.getElementById("hiveList");
const boxTabsEl = document.getElementById("boxTabs");
const frameGridEl = document.getElementById("frameGrid");
const currentHiveTitleEl = document.getElementById("currentHiveTitle");
const currentBoxTitleEl = document.getElementById("currentBoxTitle");

const addHiveBtn = document.getElementById("addHiveBtn");
const addBoxBtn = document.getElementById("addBoxBtn");
const boxNameInput = document.getElementById("boxNameInput");
const frameCountSelect = document.getElementById("frameCountSelect");

const frameDetailEl = document.getElementById("frameDetail");
const frameDetailTitleEl = document.getElementById("frameDetailTitle");
const closeFrameDetailBtn = document.getElementById("closeFrameDetailBtn");
const frameStatusSelect = document.getElementById("frameStatusSelect");
const frameNotesInput = document.getElementById("frameNotesInput");
const framePhotoInput = document.getElementById("framePhotoInput");
const framePhotoPreview = document.getElementById("framePhotoPreview");
const saveFrameBtn = document.getElementById("saveFrameBtn");

// Rendering

function render() {
  renderHives();
  renderBoxes();
  renderFrames();
  renderHeader();
  renderFrameDetail();
}

function renderHives() {
  hiveListEl.innerHTML = "";
  state.hives.forEach(hive => {
    const div = document.createElement("div");
    div.className = "hive-item" + (hive.id === state.currentHiveId ? " active" : "");
    div.textContent = hive.name || "Unnamed hive";
    div.onclick = () => {
      state.currentHiveId = hive.id;
      const firstBox = hive.boxes[0];
      state.currentBoxId = firstBox ? firstBox.id : null;
      state.currentFrameId = null;
      saveState();
      render();
    };
    hiveListEl.appendChild(div);
  });
}

function renderBoxes() {
  boxTabsEl.innerHTML = "";
  const hive = getCurrentHive();
  if (!hive) return;
  hive.boxes.forEach(box => {
    const btn = document.createElement("button");
    btn.className = "box-tab" + (box.id === state.currentBoxId ? " active" : "");
    btn.textContent = box.name;
    btn.onclick = () => {
      state.currentBoxId = box.id;
      state.currentFrameId = null;
      saveState();
      render();
    };
    boxTabsEl.appendChild(btn);
  });
}

function renderFrames() {
  frameGridEl.innerHTML = "";
  const box = getCurrentBox();
  if (!box) return;
  box.frames.forEach(frame => {
    const card = document.createElement("div");
    card.className = "frame-card";
    card.onclick = () => {
      state.currentFrameId = frame.id;
      saveState();
      renderFrameDetail();
    };

    const header = document.createElement("div");
    header.className = "frame-card-header";

    const label = document.createElement("span");
    label.textContent = `Frame ${frame.index}`;

    const status = document.createElement("span");
    status.className = "frame-status-pill";
    if (frame.status) {
      status.textContent = frame.status;
      if (frame.status === "brood") status.classList.add("frame-status-brood");
      if (frame.status === "honey") status.classList.add("frame-status-honey");
      if (frame.status === "mixed") status.classList.add("frame-status-mixed");
      if (frame.status === "empty") status.classList.add("frame-status-empty");
    } else {
      status.textContent = "–";
    }

    header.appendChild(label);
    header.appendChild(status);
    card.appendChild(header);

    if (frame.notes) {
      const notes = document.createElement("div");
      notes.textContent = frame.notes.slice(0, 40) + (frame.notes.length > 40 ? "…" : "");
      notes.style.fontSize = "11px";
      notes.style.color = "#9ca3af";
      card.appendChild(notes);
    }

    frameGridEl.appendChild(card);
  });
}

function renderHeader() {
  const hive = getCurrentHive();
  const box = getCurrentBox();
  currentHiveTitleEl.textContent = hive ? hive.name : "No hive selected";
  currentBoxTitleEl.textContent = box ? box.name : "";
}

function renderFrameDetail() {
  const frame = getCurrentFrame();
  if (!frame) {
    frameDetailEl.hidden = true;
    return;
  }
  frameDetailEl.hidden = false;
  frameDetailTitleEl.textContent = `Frame ${frame.index}`;

  frameStatusSelect.value = frame.status || "";
  frameNotesInput.value = frame.notes || "";
  framePhotoInput.value = frame.photoUrl || "";

  framePhotoPreview.innerHTML = "";
  if (frame.photoUrl) {
    const img = document.createElement("img");
    img.src = frame.photoUrl;
    framePhotoPreview.appendChild(img);
  } else {
    framePhotoPreview.textContent = "No photo";
  }
}

// Events

addHiveBtn.onclick = () => {
  const name = prompt("Hive name:", `Hive ${state.hives.length + 1}`);
  if (!name) return;
  createHive(name);
};

addBoxBtn.onclick = () => {
  const hive = getCurrentHive();
  if (!hive) {
    alert("Select or create a hive first.");
    return;
  }
  const boxName = boxNameInput.value.trim();
  const frameCount = parseInt(frameCountSelect.value, 10) || 10;
  createBox(hive.id, boxName, frameCount);
  boxNameInput.value = "";
};

closeFrameDetailBtn.onclick = () => {
  state.currentFrameId = null;
  saveState();
  renderFrameDetail();
};

saveFrameBtn.onclick = () => {
  const frame = getCurrentFrame();
  if (!frame) return;
  frame.status = frameStatusSelect.value;
  frame.notes = frameNotesInput.value;
  frame.photoUrl = framePhotoInput.value;
  saveState();
  renderFrames();
  renderFrameDetail();
};

// Init
loadState();
render();
