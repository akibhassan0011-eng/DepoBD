(function () {
    'use strict';

    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzi2_h5ayJb3seytbt1rJu8gIqwpFLqkSFQK1EMIe4Z79FlLo0fQVGiyXMa2GtLmNsW/exec";

    function getID() {
        let url = new URL(window.location.href);
        return url.searchParams.get("ids") || "";
    }

    function getAgentName() {
        let text = document.body ? document.body.innerText : "";
        let match = text.match(/C&F Agent Name[\s\S]*?:[\s\S]*?([A-Za-z0-9\s\.\&]+)/i);
        if (match) {
            let name = match[1].split("\n")[0].trim();
            if (name) return name;
        }
        return "";
    }

    function getWfexpNumbers() {
        let matches = [];

        let barcodeImgs = document.querySelectorAll("img[src*='barcode.php']");
        barcodeImgs.forEach(img => {
            let src = img.getAttribute("src");
            let match = src.match(/text=([A-Za-z0-9]+)/i);
            if (match) {
                let numberOnly = match[1].replace(/^[A-Za-z]+0?/, '');
                if (numberOnly && !matches.includes(numberOnly)) {
                    matches.push(numberOnly);
                }
            }
        });

        if (matches.length === 0) {
            let allTd = document.querySelectorAll("td");
            allTd.forEach(td => {
                let fullText = td.innerText || td.textContent;
                if (fullText.includes("WFEXP")) {
                    let match = fullText.match(/no\s*:\s*([A-Za-z0-9]+)/i);
                    if (match) {
                        let numberOnly = match[1].replace(/^[A-Za-z]+0?/, '');
                        if (numberOnly && !matches.includes(numberOnly)) {
                            matches.push(numberOnly);
                        }
                    }
                }
            });
        }

        return matches.join(", ");
    }

    function sendDataImmediately() {
        const id = getID();
        if (!id) return;

        let sentIds = [];
        try {
            sentIds = JSON.parse(localStorage.getItem('sent_depo_ids') || '[]');
        } catch (e) {
            sentIds = [];
        }

        if (sentIds.includes(id)) {
            return;
        }

        const agentName = getAgentName();
        const wfexpList = getWfexpNumbers();

        const data = {
            url: window.location.href,
            id: id,
            agent: agentName,
            F: wfexpList,
            time: new Date().toLocaleString()
        };

        const query = Object.keys(data)
            .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(data[k])}`)
            .join("&");

        GM_xmlhttpRequest({
            method: "GET",
            url: WEB_APP_URL + "?" + query
        });

        sentIds.push(id);
        localStorage.setItem('sent_depo_ids', JSON.stringify(sentIds));
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", sendDataImmediately);
    } else {
        sendDataImmediately();
    }

})();
