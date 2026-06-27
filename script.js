const STORAGE_KEY = "hivelog_advanced_v1";

let state = {
  hives: [],
  currentHiveId: null,
  currentBoxId: null,
  currentFrameIndex: null
};

// DOM refs
const hiveListEl = document.getElementById("hiveList");
const addHiveBtn = document.getElementById("addHiveBtn");
const boxNameInput = document.getElementById("boxNameInput");
const frameCountSelect = document.getElementById("frameCountSelect");
const addBoxBtn = document.getElementById("addBoxBtn");

const currentHiveTitleEl = document.getElementById("currentHiveTitle");
const currentBoxTitleEl = document.getElementById("currentBoxTitle");

const inspectionDateInput = document.getElementById("inspectionDateInput");
const weatherInput = document.getElementById("weatherInput");
const nectarInput = document.getElementById("nectarInput");
const temperamentInput = document.getElementById("temperamentInput");
const saveInspectionBtn = document.getElementById("saveInspectionBtn");

const frameGridEl = document.getElementById("frameGrid");
const frameDetailTitleEl = document.getElementById("frameDetailTitle");
const statusTagsEl = document.getElementById("statusTags");
const notesInputEl = document.getElementById("notesInput");
const saveFrameBtn = document.getElementById("saveFrameBtn");
const photoInputEl = document.getElementById("photoInput");
const photoPreviewEl = document.getElementById("photoPreview");

const inspectionListEl = document.getElementById("inspectionList");

// Persistence

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    state = JSON.parse(raw);
  } else {
    state = {
      hives: [],
      currentHiveId: null,
      currentBoxId: null,
      currentFrameIndex: null
    };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Helpers

function createHive(name) {
  const id = `hive_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const hive = {
    id,
    name: name || `Hive ${state.hives.length + 1}`,
    boxes: [],
    inspections: []
  };
  state.hives.push(hive);
  state.currentHiveId = id;
  state.currentBoxId = null;
  state.currentFrameIndex = null;
  saveState();
  render();
}

function createBox(hiveId, boxName, frameCount) {
  const hive = state.hives.find(h => h.id === hiveId);
  if (!hive) return;
  const id = `box_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const box = {
    id,
    name: boxName || `Box ${hive.boxes.length + 1}`,
    frameCount: frameCount || 8,
    frames: Array.from({ length: frameCount }, (_, i) => ({
      index: i,
      tags: [],
      notes: "",
      photoDataUrl: null
    }))
  };
  hive.boxes.push(box);
  state.currentBoxId = id;
  state.currentFrameIndex = 0;
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

// Rendering

function render() {
  renderHives();
  renderMain();
}

function renderHives() {
  hiveListEl.innerHTML = "";
  state.hives.forEach(hive => {
    const hiveItem = document.createElement("div");
    hiveItem.className = "hive-item";
    if (hive.id === state.currentHiveId) hiveItem.classList.add("active");

    const header = document.createElement("div");
    header.className = "hive-item-header";

    const title = document.createElement("div");
    title.className = "hive-item-title";
    title.textContent = hive.name;

    const count = document.createElement("div");
    count.style.fontSize = "11px";
    count.style.color = "#9ca3af";
    count.textContent = `${hive.boxes.length} box${hive.boxes.length === 1 ? "" : "es"}`;

    header.appendChild(title);
    header.appendChild(count);

    const boxList = document.createElement("div");
    boxList.className = "hive-box-list";

    hive.boxes.forEach(box => {
      const pill = document.createElement("span");
      pill.className = "box-pill";
      if (box.id === state.currentBoxId && hive.id === state.currentHiveId) {
        pill.classList.add("active");
      }
      pill.textContent = `${box.name} (${box.frameCount})`;
      pill.addEventListener("click", e => {
        e.stopPropagation();
        state.currentHiveId = hive.id;
        state.currentBoxId = box.id;
        state.currentFrameIndex = 0;
        saveState();
        render();
      });
      boxList.appendChild(pill);
    });

    hiveItem.appendChild(header);
    hiveItem.appendChild(boxList);

    hiveItem.addEventListener("click", () => {
      state.currentHiveId = hive.id;
      if (!hive.boxes.length) {
        state.currentBoxId = null;
        state.currentFrameIndex = null;
      } else {
        state.currentBoxId = hive.boxes[0].id;
        state.currentFrameIndex = 0;
      }
      saveState();
      render();
    });

    hiveListEl.appendChild(hiveItem);
  });
}

function renderMain() {
  const hive = getCurrentHive();
  const box = getCurrentBox();

  if (!hive) {
    currentHiveTitleEl.textContent = "No hive selected";
    currentBoxTitleEl.textContent = "";
    frameGridEl.innerHTML = "";
    frameDetailTitleEl.textContent = "Select a frame";
    notesInputEl.value = "";
    renderPhotoPreview(null);
    inspectionListEl.innerHTML = "";
    return;
  }

  currentHiveTitleEl.textContent = hive.name;

  if (!box) {
    currentBoxTitleEl.textContent = "No box selected";
    frameGridEl.innerHTML = "";
    frameDetailTitleEl.textContent = "Select a frame";
    notesInputEl.value = "";
    renderPhotoPreview(null);
  } else {
    currentBoxTitleEl.textContent = `${box.name} – ${box.frameCount} frames`;
    renderFrameGrid(box);
    renderFrameDetail(box);
  }

  renderInspectionTimeline(hive);
}

function renderFrameGrid(box) {
  frameGridEl.innerHTML = "";
  box.frames.forEach(frame => {
    const card = document.createElement("div");
    card.className = "frame-card";
    if (frame.index === state.currentFrameIndex) card.classList.add("active");

    const ring = document.createElement("div");
    ring.className = "frame-ring";
    if (frame.tags.includes("brood")) ring.classList.add("brood");
    else if (frame.tags.includes("honey")) ring.classList.add("honey");
    else if (frame.tags.includes("pollen")) ring.classList.add("pollen");

    const info = document.createElement("div");
    info.className = "frame-info";

    const title = document.createElement("div");
    title.className = "frame-info-title";
    title.textContent = `Frame ${frame.index + 1}`;

    const tags = document.createElement("div");
    tags.className = "frame-info-tags";
    tags.textContent = frame.tags.length
      ? frame.tags.join(", ").replace(/_/g, " ")
      : "No tags";

    info.appendChild(title);
    info.appendChild(tags);

    card.appendChild(ring);
    card.appendChild(info);

    card.addEventListener("click", () => {
      state.currentFrameIndex = frame.index;
      saveState();
      render();
    });

    frameGridEl.appendChild(card);
  });
}

function renderFrameDetail(box) {
  const frame = box.frames[state.currentFrameIndex];
  if (!frame) {
    frameDetailTitleEl.textContent = "Select a frame";
    notesInputEl.value = "";
    renderPhotoPreview(null);
    return;
  }

  frameDetailTitleEl.textContent = `Frame ${frame.index + 1}`;

  Array.from(statusTagsEl.querySelectorAll("button")).forEach(btn => {
    const tag = btn.dataset.tag;
    btn.classList.toggle("active", frame.tags.includes(tag));
  });

  notesInputEl.value = frame.notes || "";
  renderPhotoPreview(frame.photoDataUrl);
}

function renderPhotoPreview(dataUrl) {
  photoPreviewEl.innerHTML = "";
  if (!dataUrl) {
    const span = document.createElement("span");
    span.className = "placeholder";
    span.textContent = "No photo yet";
    photoPreviewEl.appendChild(span);
  } else {
    const img = document.createElement("img");
    img.src = dataUrl;
    photoPreviewEl.appendChild(img);
  }
}

function renderInspectionTimeline(hive) {
  inspectionListEl.innerHTML = "";
  if (!hive.inspections || !hive.inspections.length) return;

  hive.inspections
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .forEach(ins => {
      const item = document.createElement("div");
      item.className = "inspection-item";

      const header = document.createElement("div");
      header.className = "inspection-item-header";

      const date = document.createElement("div");
      date.textContent = ins.date;

      const meta = document.createElement("div");
      meta.className = "inspection-item-meta";
      meta.textContent = `${ins.weather || "–"} | ${ins.nectar || "–"} | ${ins.temperament || "–"}`;

      header.appendChild(date);
      header.appendChild(meta);

      const body = document.createElement("div");
      body.className = "inspection-item-body";
      body.textContent = ins.summary || "";

      item.appendChild(header);
      item.appendChild(body);

      inspectionListEl.appendChild(item);
    });
}

// Events

addHiveBtn.addEventListener("click", () => {
  const name = prompt("Hive name:", `Hive ${state.hives.length + 1}`);
  createHive(name || undefined);
});

addBoxBtn.addEventListener("click", () => {
  const hive = getCurrentHive();
  if (!hive) {
    alert("Select or create a hive first.");
    return;
  }
  const boxName = boxNameInput.value.trim();
  const frameCount = parseInt(frameCountSelect.value, 10) || 8;
  createBox(hive.id, boxName, frameCount);
  boxNameInput.value = "";
});

statusTagsEl.addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const tag = btn.dataset.tag;
  const box = getCurrentBox();
  if (!box) return;
  const frame = box.frames[state.currentFrameIndex];
  if (!frame) return;

  if (frame.tags.includes(tag)) {
    frame.tags = frame.tags.filter(t => t !== tag);
  } else {
    frame.tags.push(tag);
  }
  saveState();
  render();
});

photoInputEl.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const box = getCurrentBox();
  if (!box) return;
  const frame = box.frames[state.currentFrameIndex];
  if (!frame) return;

  const reader = new FileReader();
  reader.onload = () => {
    frame.photoDataUrl = reader.result;
    saveState();
    renderPhotoPreview(reader.result);
    renderFrameGrid(box);
  };
  reader.readAsDataURL(file);
});

saveFrameBtn.addEventListener("click", () => {
  const box = getCurrentBox();
  if (!box) return;
  const frame = box.frames[state.currentFrameIndex];
  if (!frame) return;

  frame.notes = notesInputEl.value;
  saveState();
});

saveInspectionBtn.addEventListener("click", () => {
  const hive = getCurrentHive();
  const box = getCurrentBox();
  if (!hive || !box) {
    alert("Select a hive and box before saving an inspection.");
    return;
  }

  const date =
    inspectionDateInput.value || new Date().toISOString().slice(0, 10);
  const weather = weatherInput.value.trim();
  const nectar = nectarInput.value.trim();
  const temperament = temperamentInput.value.trim();

  const changedFrames = box.frames
    .filter(f => f.tags.length || (f.notes && f.notes.trim().length))
    .map(f => `F${f.index + 1}: ${f.tags.join(", ").replace(/_/g, " ") || "notes"}`);

  const summary =
    changedFrames.length > 0
      ? `Box ${box.name}: ${changedFrames.join(" | ")}`
      : `Box ${box.name}: no notable changes`;

  hive.inspections.push({
    date,
    weather,
    nectar,
    temperament,
    summary
  });

  saveState();
  renderInspectionTimeline(hive);
});

// Boot

loadState();
render();

// If no hives, create a starter one
if (!state.hives.length) {
  createHive("Hive 1");
  createBox(state.currentHiveId, "Deep A", 8);
}
