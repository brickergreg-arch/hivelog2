* {
  box-sizing: border-box;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

body {
  margin: 0;
  background: #f5f5f5;
  color: #222;
}

header {
  background: #ffd54f;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-bottom: 1px solid #e0b200;
}

header h1 {
  margin: 0;
  font-size: 1.6rem;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.controls label {
  display: flex;
  align-items: center;
  gap: 4px;
}

main {
  padding: 16px;
}

#framesSection h2 {
  margin-top: 0;
}

#framesGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.frame-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 10px;
  border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.frame-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.frame-id {
  font-weight: 600;
}

.photo-btn {
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ffa000;
  background: #ffecb3;
  cursor: pointer;
}

.photo-btn:hover {
  background: #ffe082;
}

.notes-label {
  font-size: 0.8rem;
  color: #555;
}

.frame-notes {
  width: 100%;
  min-height: 60px;
  resize: vertical;
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 0.85rem;
}

.photo-status {
  font-size: 0.75rem;
  color: #777;
}

footer {
  border-top: 1px solid #ddd;
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
}

#saveBtn {
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #2e7d32;
  background: #4caf50;
  color: #fff;
  cursor: pointer;
}

#saveBtn:hover {
  background: #43a047;
}

#status {
  font-size: 0.8rem;
  color: #555;
}
