const { ipcRenderer } = require("electron");

document.addEventListener("DOMContentLoaded", () => {
  const textInput = document.getElementById("textInput");
  const saveBtn = document.getElementById("saveBtn");
  const searchInput = document.getElementById("searchInput");
  const tableBody = document.querySelector("#textTable tbody");

  let allData = []; // Store full data list

  function renderTable(data) {
    tableBody.innerHTML = "";
    console.log("Before Sorting:", data); // Debugging

    data.sort((a, b) => {
      console.log(`Comparing: ${a.lastUsed} vs ${b.lastUsed}`);
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
    if (newText) {
      ipcRenderer.invoke("save-text", newText).then((data) => {
        allData = data;
        renderTable(data);
      });
      textInput.value = "";
    }
  });

  // Handle Copy and Delete actions
  tableBody.addEventListener("click", (event) => {
    if (event.target.classList.contains("copy-btn")) {
      const text = event.target.dataset.text;
      navigator.clipboard.writeText(text);
      ipcRenderer.invoke("update-last-used", text).then((data) => {
        allData = data;
        renderTable(data);
      });
    }
    if (event.target.classList.contains("delete-btn")) {
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
