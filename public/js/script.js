const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const subjectInput = document.getElementById("subject-input");
const dateInput = document.getElementById("date-input");
const outputArea = document.getElementById("output-container");
const htmlSwitch = document.getElementById("html-switch");
const markSwitch = document.getElementById("mark-read-switch");
const boxSwitch = document.getElementById('box-switch');
const getEmailButton = document.getElementById("get-email-btn");
const getContentButton = document.getElementById("get-content-btn");
const notice = document.querySelector('.notice');
const closeBtn = document.querySelector('.close-btn');

let mailContent = null;

async function getEmail() {
    outputArea.textContent = 'Getting mail……';
    const response = await fetch("http://localhost:30001/post/mailInfo", {
        method: "POST"
    });
    const data = await response.json();
    if (response.ok) {
        outputArea.textContent = '';
        if (data.status !== 200) {
            outputArea.textContent = data.message;
            return;
        }
        emailInput.value = data.data.email;
        passwordInput.value = data.data.password;
        const dateNow = new Date();
        const year = dateNow.getFullYear();
        const month = (dateNow.getMonth() + 1);
        const day = dateNow.getDate();
        const date = `${year}-${month < 10 ? '0' + month : month}-${day}`;
        dateInput.value = date;
    } else {
        outputArea.textContent = data.message;
    }
}

async function getContent() {
    outputArea.textContent = 'Getting contents……';
    const email = emailInput.value;
    const password = passwordInput.value;
    const subject = subjectInput.value.toLowerCase();
    const fromDate = dateInput.value;
    const showHtml = htmlSwitch.checked;
    const markRead = markSwitch.checked;
    const boxType = boxSwitch.checked ? 'Junk' : 'INBOX';

    if (!email || !password || !subject || !fromDate) {
        outputArea.textContent = "Please fill in all fields";
        return;
    }

    const response = await fetch("http://localhost:30001/post/mailContent", {
        method: "POST",
        body: JSON.stringify({ email, password, subject, fromDate, showHtml, markRead, boxType }),
        headers: {
            "Content-Type": "application/json"
        }
    });
    const data = await response.json();
    if (response.ok) {
        if (data.status !== 200) {
            outputArea.textContent = data.message;
            return;
        }
        mailContent = data.data;
        const output = showHtml ? mailContent.textAsHtml : mailContent.text;
        outputArea.innerHTML = output;
    } else {
        outputArea.textContent = data.message;
    }
}

function showHtml() {
    if (mailContent) {
        outputArea.innerHTML = mailContent.textAsHtml;
    }
}

function showText() {
    if (mailContent) {
        outputArea.innerHTML = mailContent.text;
    }
}

function changeShowType() {
    if (htmlSwitch.checked) {
        showHtml();
    } else {
        showText();
    }
}

function closeNotice() {
    notice.style.display = 'none';
}

getEmailButton.addEventListener("click", getEmail);
getContentButton.addEventListener("click", getContent);
htmlSwitch.addEventListener("change", changeShowType);
closeBtn.addEventListener("click", closeNotice);