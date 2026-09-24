
(async function () {
  'use strict';
    // 🎯 Target User ID to match
const TARGET_USER_ID = "Shafiqul";

// 🔍 Extract User ID from the web page
const pageText = document.body.innerText;
const userMatch = pageText.match(/User\s*ID\s*:\s*([^\s]+)/i);
const currentPageUserId = userMatch ? userMatch[1].trim() : "";

// 🛑 Stop execution if User ID does not match
if (currentPageUserId.toLowerCase() !== TARGET_USER_ID.toLowerCase()) {
  console.log(`⛔ User ID mismatch! Page User: "${currentPageUserId}", Expected: "${TARGET_USER_ID}". Script stopped.`);
  return;
}

console.log(`✅ User ID matched (${TARGET_USER_ID}). Proceeding with execution...`);

  const url = new URL(window.location.href);
  const section = url.searchParams.get("Section");

  if (section !== "Welfare Export Depot") {
    console.log("⛔ Not Welfare Export Depot page");
    return;
  }

  const CONTROL_URL = "https://script.google.com/macros/s/AKfycbx0aMk4Dh_4O9yWCGbgxkhSNktbsR0YCXKMr8RuRa0link2HcbB84u9XF0tK_rh051x/exec";
  const API_URL = "https://script.google.com/macros/s/AKfycbztJg60P0moMryapCv0DRCMHNrQuBBKsOI4ZhjSaNG45wLomylYsPZofDIJPviGJSoD/exec";

  try {
    const ctrlRes = await fetch(`${CONTROL_URL}?t=${Date.now()}`);
    const ctrl = await ctrlRes.json();

    if (ctrl.status !== "ON") {
      console.log("⛔ Script OFF from Google Sheet");
      return;
    }

    await runMainScript();

  } catch (err) {
    console.error("Initialization error:", err);
  }

  async function runMainScript() {
    try {
      const pageText = document.body.innerText;

      let startDate, endDate;
      const rangeMatch = pageText.match(/Date:\s*(\d{4}-\d{2}-\d{2})\s+To\s+(\d{4}-\d{2}-\d{2})/i);
      const singleMatch = pageText.match(/Date:\s*(\d{4}-\d{2}-\d{2})/);

      if (rangeMatch) {
        startDate = new Date(rangeMatch[1]);
        endDate = new Date(rangeMatch[2]);
      } else if (singleMatch) {
        startDate = new Date(singleMatch[1]);
        endDate = new Date(singleMatch[1]);
      } else {
        console.warn("⚠️ No Valid Date found on page.");
        return;
      }

      let cachedData = JSON.parse(localStorage.getItem('receipt_perfect_cache'));
      if (cachedData && cachedData.length > 0) {
        renderTableData(cachedData, startDate, endDate);
      }

      const res = await fetch(`${API_URL}?t=${Date.now()}`);
      const incomingData = await res.json();

      if (incomingData && incomingData.length > 0) {
        if (!cachedData || cachedData.length !== incomingData.length) {
          localStorage.setItem('receipt_perfect_cache', JSON.stringify(incomingData));
          if (cachedData) {
             window.location.reload();
          } else {
             renderTableData(incomingData, startDate, endDate);
          }
        }
      }

    } catch (err) {
      console.error("Error running main script:", err);
    }
  }

  function renderTableData(dataArray, startDate, endDate) {
    const customRows = document.querySelectorAll(".inserted-by-script");
    customRows.forEach(row => row.remove());

    const filteredData = dataArray.filter(row => {
      const dt = new Date(row[3]);
      if (isNaN(dt)) return false;
      const checkDate = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
      const sDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const eDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      return checkDate >= sDate && checkDate <= eDate;
    });

    if (filteredData.length === 0) return;

    const table = document.querySelector("table[border='1']");
    if (!table) return;
    const tbody = table.querySelector("tbody") || table;

    // Data loop and placement inside table based on MR Number
    filteredData.forEach((data) => {
      const [name, numStr, code, dateTime, , sheetMrVal] = data;
      const mrNo = sheetMrVal || "";
      const newMrNum = parseInt(mrNo, 10) || 0; // MR Number Number format-e convert
      const num = parseFloat(numStr) || 0;
      const dt = new Date(dateTime);

      if (isNaN(dt)) return;

      const timeOnly = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;

      let rate = 125;
      const rawRows = Array.from(tbody.querySelectorAll("tr:not(.inserted-by-script)"));
      for (let r of rawRows) {
        const rowTime = r.children[6]?.textContent?.trim();
        if (rowTime === timeOnly) {
          const foundRate = parseFloat(r.children[8]?.textContent?.trim());
          if (!isNaN(foundRate)) {
            rate = foundRate;
            break;
          }
        }
      }

      const total = num * rate;
      const newRow = document.createElement("tr");
      newRow.className = "inserted-by-script";

      newRow.innerHTML = `
          <td align="center">0</td>
          <td align="center">${mrNo}</td>
          <td>${name}</td>
          <td>${code}</td>
          <td>&nbsp;</td>
          <td></td>
          <td>${timeOnly}</td>
          <td align="right">${num}</td>
          <td align="right">${rate.toFixed(2)}</td>
          <td align="right">${total}</td>
      `;

      let inserted = false;
      const currentRows = Array.from(tbody.querySelectorAll("tr"));
      const currentTotalRow = currentRows.find(r => r.textContent.includes("Total"));

      // ─── MR Number দিয়ে পজিশন মেলানো (Sorting by MR No) ───
      for (let r of currentRows) {
        if (r === currentTotalRow) break;
        if (r.querySelector("th") || (r.children[0] && r.children[0].textContent.includes("SL"))) continue;

        const existingMrNum = parseInt(r.children[1]?.textContent?.trim(), 10) || 0;

        // নতুন MR ছোট বা সমান হলে তার ঠিক উপরে বসবে
        if (existingMrNum > 0 && newMrNum < existingMrNum) {
          r.parentNode.insertBefore(newRow, r);
          inserted = true;
          break;
        }
      }

      if (!inserted) {
        if (currentTotalRow) {
          currentTotalRow.parentNode.insertBefore(newRow, currentTotalRow);
        } else {
          tbody.appendChild(newRow);
        }
      }
    });

    // ─── SERIAL NUMBER (SL) RE-NUMBERING ───
    const allRows = Array.from(tbody.querySelectorAll("tr"));
    let currentSL = 1;

    allRows.forEach(row => {
      const firstCell = row.children[0];
      if (!firstCell) return;

      const cellText = firstCell.textContent.trim();

      if (row.querySelector("th") || cellText.toUpperCase().includes("SL") || row.textContent.includes("Total")) {
        return;
      }

      firstCell.textContent = currentSL++;
    });

    console.log(`📊 Rendered. Sorted by MR Number successfully.`);
  }
})();
