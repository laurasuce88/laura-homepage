const STORAGE_KEY = "minimal-notes-v1";

const state = {
  categories: ["默认"],
  notes: [],
  search: "",
};

const els = {
  quickInput: document.getElementById("quickInput"),
  categorySelect: document.getElementById("categorySelect"),
  addBtn: document.getElementById("addBtn"),
  newCategoryInput: document.getElementById("newCategoryInput"),
  addCategoryBtn: document.getElementById("addCategoryBtn"),
  searchInput: document.getElementById("searchInput"),
  notesList: document.getElementById("notesList"),
  noteTpl: document.getElementById("noteTpl"),
  countText: document.getElementById("countText"),
};

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!data) return;
    if (Array.isArray(data.categories) && data.categories.length) {
      state.categories = [...new Set(data.categories)];
    }
    if (Array.isArray(data.notes)) {
      state.notes = data.notes;
    }
  } catch (_) {}
}

function renderCategories() {
  const current = els.categorySelect.value || state.categories[0];
  els.categorySelect.innerHTML = "";
  state.categories.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    els.categorySelect.appendChild(opt);
  });
  if (state.categories.includes(current)) {
    els.categorySelect.value = current;
  }
}

function formatTime(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function getVisibleNotes() {
  const q = state.search.trim().toLowerCase();
  if (!q) return state.notes;
  return state.notes.filter((n) => {
    const text = `${n.content} ${n.category}`.toLowerCase();
    return text.includes(q);
  });
}

function renderNotes() {
  const visible = getVisibleNotes();
  els.notesList.innerHTML = "";

  visible
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach((note) => {
      const node = els.noteTpl.content.cloneNode(true);
      node.querySelector(".tag").textContent = note.category;
      node.querySelector(".content").textContent = note.content;
      node.querySelector(".time").textContent = formatTime(note.createdAt);
      node.querySelector(".del").addEventListener("click", () => {
        state.notes = state.notes.filter((n) => n.id !== note.id);
        save();
        renderNotes();
      });
      els.notesList.appendChild(node);
    });

  els.countText.textContent = `${visible.length} 条笔记`;
}

function addNote() {
  const content = els.quickInput.value.trim();
  if (!content) return;
  const category = els.categorySelect.value || "默认";

  state.notes.push({
    id: crypto.randomUUID(),
    content,
    category,
    createdAt: Date.now(),
  });

  els.quickInput.value = "";
  save();
  renderNotes();
  els.quickInput.focus();
}

function addCategory() {
  const c = els.newCategoryInput.value.trim();
  if (!c) return;
  if (!state.categories.includes(c)) {
    state.categories.push(c);
    save();
    renderCategories();
    els.categorySelect.value = c;
  }
  els.newCategoryInput.value = "";
  els.newCategoryInput.focus();
}

function bindEvents() {
  els.addBtn.addEventListener("click", addNote);
  els.quickInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addNote();
  });

  els.addCategoryBtn.addEventListener("click", addCategory);
  els.newCategoryInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addCategory();
  });

  els.searchInput.addEventListener("input", (e) => {
    state.search = e.target.value;
    renderNotes();
  });
}

(function init() {
  load();
  bindEvents();
  renderCategories();
  renderNotes();
})();
