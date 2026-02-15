/* ── THEME TOGGLE ─────────────────────────── */
const html = document.documentElement;
const themeBtn = document.getElementById("theme-btn");
const themeIcon = document.getElementById("theme-icon");
const themeLabel = document.getElementById("theme-label");
let isDark = true;

themeBtn.addEventListener("click", () => {
    isDark = !isDark;
    html.setAttribute("data-theme", isDark ? "dark" : "light");
    themeIcon.textContent = isDark ? "☀" : "☾";
    themeLabel.textContent = isDark ? "Light" : "Dark";
});

/* ── FILE INPUT / DRAG ────────────────────── */
const input = document.getElementById("images");
const fileList = document.getElementById("file-list");
const uploadBtn = document.getElementById("upload-btn");
const countBadge = document.getElementById("count-badge");
const dropZone = document.getElementById("drop-zone");
const divider = document.getElementById("card-divider");

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
}

function renderFiles(files) {
    fileList.innerHTML = "";
    if (!files || files.length === 0) {
        uploadBtn.disabled = true;
        countBadge.classList.add("hidden");
        divider.style.display = "none";
        return;
    }

    Array.from(files).forEach((f) => {
        const li = document.createElement("li");
        li.className = "file-item";
        li.innerHTML = `
            <div class="fi-dot"></div>
            <div class="fi-name">${f.name}</div>
            <div class="fi-size">${formatBytes(f.size)}</div>`;
        fileList.appendChild(li);
    });

    uploadBtn.disabled = false;
    countBadge.textContent = files.length;
    countBadge.classList.remove("hidden");
    divider.style.display = "block";
}

input.addEventListener("change", () => renderFiles(input.files));

/* drag-over highlight */
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("drag-over");
});
dropZone.addEventListener("dragleave", () =>
    dropZone.classList.remove("drag-over"),
);
dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-over");
    if (e.dataTransfer.files.length) {
        /* Transfer files to the actual input (DataTransfer trick) */
        const dt = new DataTransfer();
        Array.from(e.dataTransfer.files).forEach((f) => dt.items.add(f));
        input.files = dt.files;
        renderFiles(input.files);
    }
});

/* ── FORM SUBMIT ──────────────────────────── */
document
    .getElementById("uploadForm")
    .addEventListener("submit", async (e) => {
        e.preventDefault();

        //
        const btn = uploadBtn;
        btn.textContent = "Uploading…";
        btn.disabled = true;

        /* Replace this with your real upload logic (fetch / FormData) */

        const files = document.getElementById("images").files;
        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            formData.append("images", files[i]);
        }

        const response = await fetch("http://localhost:5000/upload", {
            method: "POST",
            body: formData,
        });

        const images = await response.json();
        localStorage.setItem("uploadedImages", JSON.stringify(images));
        console.log("Upload response:", images);
        //

        setTimeout(() => {
            btn.innerHTML = "✓ &nbsp;Uploaded";
            btn.style.background = "#5a8a5a";
        }, 1200);
    });
