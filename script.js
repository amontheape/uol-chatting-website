function loadPage() {
    const button = document.querySelector(".wrapper button");
    button.addEventListener("click", getName);

    document.querySelector(".wrapper input").addEventListener("keyup", (pressed)=>{
        if(pressed.keyCode === 13){
            button.click();
        };
    });

    const sendButton = document.querySelector("footer .icon-box");
    sendButton.addEventListener("click", sendMessage);

    document.querySelector("footer input").addEventListener("keyup", (pressed)=>{
        if(pressed.keyCode === 13){
            sendMessage();
        };
    });
}

let userName, onlineInterval;

function getName() {

    document.querySelector(".wrapper span").classList.add("hidden");

    userName = document.querySelector(".wrapper input").value;

    const nameCheckPromise = axios.post("https://mock-api.driven.com.br/api/v4/uol/participants", {name: userName});

    nameCheckPromise.then(()=> {
        loadChat();

        document.querySelector(".wrapper").classList.add("hidden");

        onlineInterval = setInterval(()=> {
            const onlineStatusPromise = axios.post("https://mock-api.driven.com.br/api/v4/uol/status", {name: userName});

            onlineStatusPromise.then(()=>console.log("post status OK"));
            onlineStatusPromise.catch(leaveChat);
        }, 5000);
    });

    nameCheckPromise.catch(nameError);
}

function nameError(error) {
    if (error.response.status === 400) {
        document.querySelector(".wrapper input").value = '';
        document.querySelector(".wrapper span").classList.toggle("hidden");
    }
}

let chatInterval;

function loadChat() {

    const getServerMessagesPromise = axios.get("https://mock-api.driven.com.br/api/v4/uol/messages");

    getServerMessagesPromise.then( ( {data} )=> {

        const messageBox = document.querySelector(".messages-box");

        messageBox.innerHTML = "";

        const filteredData = data.filter((message)=> !(message.type === 'private_message' && message.to !== userName));

        filteredData.forEach( message => {
            messageBox.innerHTML += messageCustomizer(message);
        });

        const newScroll = document.querySelectorAll(".msg");
        newScroll[newScroll.length - 1].scrollIntoView(); 

    });

    chatInterval = setInterval(loadChat, 3000);
}

function messageCustomizer( {from, to, text, type, time='agora'} ) {
    
    switch (type) {
        case 'status': 
            return `<div class="msg status"data-identifier="message">
                        <span class="time">(${time})</span>
                        <strong>${from}</strong>
                        ${text}
                    </div>`;

        case 'message':
            return `<div class="msg normal" data-identifier="message"> 
                        <span class="time">(${time})</span>
                        <strong>${from}</strong> para<strong>${to}</strong>:
                        ${text}
                    </div>`;

        case 'private_message':
            return `<div class="msg private" data-identifier="message">
                        <span class="time">(${time})</span>
                        <strong>${from}</strong> reservadamente para<strong>${to}</strong>:
                        ${text}
                    </div>`;

        default :
            break;
    }
}

function sendMessage() {

    const footerInput = document.querySelector("footer input");

    const currentMsg = {
        from: userName,
        to: "Todos",
        text: footerInput.value,
        type: "message"
    };
    
    const messageSent = axios.post("https://mock-api.driven.com.br/api/v4/uol/messages", currentMsg);

    const messageBox = document.querySelector(".messages-box");

    messageBox.innerHTML += messageCustomizer(currentMsg);

    const newMsgScroll = document.querySelectorAll(".msg");
    newMsgScroll[newMsgScroll.length - 1].scrollIntoView();

    footerInput.value = '';

    messageSent.catch(treatMsgError);
}

function treatMsgError(error) {
    if (error.response.status === 400) {
        alert("Usuário desconectado por inatividade não pode enviar msg!");
        clearInterval(chatInterval);
        setTimeout(window.location.reload(), 1500);
    };
}

function leaveChat() {
    clearInterval(onlineInterval);
    clearInterval(chatInterval);

    alert("Desconectado por inatividade! Realize novo login.");

    setTimeout(window.location.reload(), 1500);
}

loadPage();