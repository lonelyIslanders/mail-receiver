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
const transferSwitch = document.getElementById('transfer-switch');

let mailContent = null;
let socket = null;
let timer = null;

//手动获取邮箱信息
async function getEmail() {
    outputArea.innerHTML = '<span style="color:#b3f">Getting……</span>';
    const response = await fetch("http://npmcow.com:30001/post/mailInfo", {
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

//手动获取邮件内容
async function getContent() {
    outputArea.innerHTML = '<span style="color:#b3f">Getting contents……</span>';
    const email = emailInput.value;
    const password = passwordInput.value;
    const subject = subjectInput.value.toLowerCase();
    const fromDate = dateInput.value;
    const showHtml = htmlSwitch.checked;
    const markRead = markSwitch.checked;
    const boxType = boxSwitch.checked ? 'Junk' : 'INBOX';

    if (!email || !password || !subject || !fromDate) {
        outputArea.innerHTML = '<span style="color:red">Please fill in all fields</span>';
        return;
    }

    const response = await fetch("http://npmcow.com:30001/post/mailContent", {
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


//开启自动获取邮件内容
function autoGetContent() {
    if (transferSwitch.checked) { //开启了socket
        outputArea.innerHTML = '<span style="color:#b3f">socket正在连接……</span>'
        socket = io();
        getContentButton.style.display = 'none';//隐藏手动获取按钮
        socket.on('status', status => { //监听连接状况
            outputArea.innerHTML = status;
        })
        socket.on('mailContent', content => { //监听邮件内容
            const showHtml = htmlSwitch.checked;
            mailContent = content.data;
            const output = showHtml ? mailContent.textAsHtml : mailContent.text;
            outputArea.innerHTML = output;
        })
        timer = setInterval(() => {
            const email = emailInput.value;
            const password = passwordInput.value;
            const subject = subjectInput.value.toLowerCase();
            const fromDate = dateInput.value;
            const markRead = markSwitch.checked;
            const boxType = boxSwitch.checked ? 'Junk' : 'INBOX';
            if (!email || !password || !subject || !fromDate) {
                outputArea.innerHTML = '<span style="color:red">Please fill in all fields</span>';
                return;
            }
            outputArea.innerHTML = '<span style="color:#b3f">Getting contents……</span>';
            const data = { email, password, subject, fromDate, markRead, boxType }//构造数据
            socket.emit('sendMailInfo', data)//发送数据
        }, 3000);
    } else {                //关闭了socket
        clearInterval(timer)//清除定时器
        if (socket) {
            socket.disconnect()
            getContentButton.style.display = 'block'//恢复手动获取按钮
        }
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
transferSwitch.addEventListener("click", autoGetContent)