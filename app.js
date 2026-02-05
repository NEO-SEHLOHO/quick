// Bump the store key to force fresh seed with the CUT links
const storeKey = "cut_quick_links_v2";
const linkListEl = document.getElementById("linkList");
const favListEl = document.getElementById("favList");
const searchEl = document.getElementById("search");
const dialogEl = document.getElementById("linkDialog");
const formEl = document.getElementById("linkForm");
const tpl = document.getElementById("cardTpl");

let links = load();
render();

document.getElementById("addBtn").onclick = () => dialogEl.showModal();
document.getElementById("cancel").onclick = () => dialogEl.close();
formEl.onsubmit = (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const url = document.getElementById("url").value.trim();
  const category = document.getElementById("category").value.trim();
  if (!title || !url) return;
  links.push({ id: crypto.randomUUID(), title, url, category, fav: false });
  persist();
  render();
  formEl.reset();
  dialogEl.close();
};

searchEl.oninput = render;

function render() {
  const term = searchEl.value.toLowerCase();
  const filtered = links.filter(l => {
    const title = (l.title || "").toLowerCase();
    const category = (l.category || "").toLowerCase();
    return title.includes(term) || category.includes(term);
  });
  fillList(linkListEl, filtered);
  fillList(favListEl, filtered.filter(l => l.fav));
}

function fillList(container, items) {
  container.innerHTML = "";
  items.forEach(link => {
    const node = tpl.content.cloneNode(true);
    node.querySelector(".tag").textContent = link.category || "General";
    node.querySelector(".title").textContent = link.title;
    const a = node.querySelector(".link");
    a.href = link.url;
    a.textContent = new URL(link.url).host.replace("www.", "");
    const favBtn = node.querySelector(".fav");
    if (link.fav) favBtn.classList.add("is-fav");
    favBtn.onclick = () => toggleFav(link.id);
    container.appendChild(node);
  });
}

function toggleFav(id) {
  links = links.map(l => l.id === id ? { ...l, fav: !l.fav } : l);
  persist();
  render();
}

function persist() { localStorage.setItem(storeKey, JSON.stringify(links)); }
function load() {
  try {
    const stored = JSON.parse(localStorage.getItem(storeKey));
    if (!stored || !Array.isArray(stored) || stored.length === 0) return seed();
    return stored.map(normalizeLink);
  }
  catch { return seed(); }
}

function seed() {
  const cutLinks = [
    {
      title: "CUT eThuto",
      category: "Learning Management System",
      url: "https://ethuto.cut.ac.za",
    },
    {
      title: "Time-Table",
      category: "Contact and help center",
      url: "https://timetable.cut.ac.za/BLOEM_CALENDAR/cal?vt=agendaWeek&dt=2025-08-01&et=module",
    },
    {
      title: "Student Portal",
      category: "Login to access student records",
      url: "https://student.cut.ac.za",
    },
    {
      title: "CUT iEnabler",
      category: "Registration and applications",
      url: "https://enroll.cut.ac.za/pls/prodi41/w99pkg.mi_login",
    },
    {
      title: "Call log with IT",
      category: "Reset password, update numbers etc",
      url: "https://forms.office.com/Pages/ResponsePage.aspx?id=ScFAubeRz0u6LA242BcZbbMY6Qk1aoRFmvvnQpQnmzVURDFSUDVQNVVYWUhZNFlIVjJJT0VSWDhMOC4u",
    },
    {
      title: "Library",
      category: "Access books and academic resources",
      url: "https://www.cut.ac.za/library",
    },
    {
      title: "Current Students",
      category: "Resources for enrolled students",
      url: "https://www.cut.ac.za/current-students",
    },
    {
      title: "Ask CUT",
      category: "Contact and help center",
      url: "https://askcut.cut.ac.za/support/home",
    },
  ];

  return cutLinks.map(link => ({
    id: crypto.randomUUID(),
    fav: false,
    ...link,
  }));
}

function normalizeLink(link) {
  return {
    id: link.id || crypto.randomUUID(),
    title: link.title || "Untitled",
    url: link.url || "#",
    category: link.category || link.subtitle || "General",
    fav: !!link.fav,
  };
}
