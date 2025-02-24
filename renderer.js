const { ipcRenderer } = require("electron");

document.addEventListener("DOMContentLoaded", () => {
  const titleInput = document.getElementById("titleInput");
  const textInput = document.getElementById("textInput");
  const saveBtn = document.getElementById("saveBtn");
  const searchInput = document.getElementById("searchInput");
  const tableBody = document.querySelector("#textTable tbody");

  let allData = []; // Store full data list

  function renderTable(data) {
    tableBody.innerHTML = "";
    data.sort((a, b) => {
      return new Date(b.lastUsed) - new Date(a.lastUsed);
    });

    console.log("After Sorting:", data); // Debugging

    data.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${item.text}</td>
                <td>
                    <button class="copy-btn" data-text="${item.text}">Copy</button>
                    <button class="delete-btn" data-text="${item.text}">Delete</button>
                </td>
            `;
      tableBody.appendChild(row);
    });
  }

  // Load saved data
  ipcRenderer.invoke("load-data").then((data) => {
    allData = data;
    renderTable(data);
  });

  // Save new text
  saveBtn.addEventListener("click", () => {
    const newText = textInput.value.trim();
    const newTitle = titleInput.value.trim();
    if (newText) {
      ipcRenderer.invoke("save-text", newTitle, newText).then((data) => {
        allData = data;
        renderTable(data);
      });
      textInput.value = "";
      titleInput.value = "";
    }
  });

  // Handle Copy and Delete actions
  tableBody.addEventListener("click", (event) => {
    if (event.target.classList.contains("copy-btn")) {
      const text = event.target.dataset.text;
      navigator.clipboard.writeText(text);
      console.log("copy-btn", text);

      ipcRenderer.invoke("update-last-used", text).then((data) => {
        allData = data;
        renderTable(data);
      });
    }
    if (event.target.classList.contains("delete-btn")) {
      console.log("delete-btn", event.target.dataset.text);

      const text = event.target.dataset.text;
      ipcRenderer.invoke("delete-text", text).then((data) => {
        allData = data;
        renderTable(data);
      });
    }
  });

  // Search function
  searchInput.addEventListener("input", () => {
    const searchText = searchInput.value.toLowerCase();
    const filteredData = allData.filter((item) =>
      item.text.toLowerCase().includes(searchText)
    );
    renderTable(filteredData);
  });
});
