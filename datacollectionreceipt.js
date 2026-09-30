(function() {
    'use strict';

    // ⚠️ নিচে আপনার স্টেপ ১ থেকে পাওয়া নতুন Web App URL-টি বসান
    const GOOGLE_SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwW55zEio9cBg1wJvE5YW7eldkbXHjdPKOdk3cJbJDldpGRvt6uGV_nQPzLeZZa9HeV/exec";

    function sendData() {
        let usernameElem = document.getElementById('username');
        let sectionElem = document.getElementById('Section');

        let selectedUser = (usernameElem && usernameElem.selectedIndex !== -1) ? usernameElem.options[usernameElem.selectedIndex].text : '';
        let selectedSection = (sectionElem && sectionElem.selectedIndex !== -1) ? sectionElem.options[sectionElem.selectedIndex].text : '';

        let loggedUserText = "Unknown";
        let headerDiv = document.querySelector('.headercontent div');
        if (headerDiv) {
            loggedUserText = headerDiv.innerText.split('\n')[0].replace('Hello,', '').trim();
        }

        let payload = {
            pageUrl: window.location.href,
            loggedUser: loggedUserText,
            fromDate: document.getElementById('fdate') ? document.getElementById('fdate').value : '',
            toDate: document.getElementById('tdate') ? document.getElementById('tdate').value : '',
            selectedUser: selectedUser,
            section: selectedSection
        };

        // গুগল শিটে ডেটা পাঠানো
        GM_xmlhttpRequest({
            method: "POST",
            url: GOOGLE_SHEET_WEB_APP_URL,
            headers: {
                "Content-Type": "text/plain"
            },
            data: JSON.stringify(payload),
            onload: function(res) {
                console.log("Sheet Response:", res.responseText);
            },
            onerror: function(err) {
                console.error("Sheet Error:", err);
            }
        });
    }

    // ১. পেজ লোড হওয়া মাত্রই বর্তমান ডেটা শিটে পাঠাবে
    window.addEventListener('load', function() {
        setTimeout(sendData, 1000); // ১ সেকেন্ড পর অটোমেটিক পাঠাবে
    });

    // ২. কোনো ড্রপডাউন পরিবর্তন করলে সাথে সাথেই আপডেট ডেটা পাঠাবে
    document.addEventListener('change', function(e) {
        if (e.target.id === 'username' || e.target.id === 'Section') {
            sendData();
        }
    });

    // ৩. প্রিন্ট বাটনে ক্লিক করলেও পাঠাবে
    document.addEventListener('click', function(e) {
        if (e.target && (e.target.value === 'Print' || e.target.type === 'submit')) {
            sendData();
        }
    });

})();
