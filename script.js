function loadPage() {
    const button = document.querySelector(".wrapper button");
    button.addEventListener("click", getName);

    document.querySelector(".wrapper input").addEventListener("keyup", (pressed)=>{
        if(pressed.keyCode === 13){
            button.click();
        };
    });
}

function getName() {
    const name = document.querySelector(".wrapper input").value;

    const nameCheckPromise = axios.post("https://mock-api.driven.com.br/api/v4/uol/participants", {name});

    nameCheckPromise.then(loadChat);
    nameCheckPromise.catch(nameError);
}

function nameError(error) {
    if (error.response.status === 400) {
        document.querySelector(".wrapper input").value = '';
        document.querySelector(".wrapper span").classList.toggle("hidden");
    } else {
        console.log(error);
    };
}

function loadChat() {
    const getServerMessagesPromise = axios.get("https://mock-api.driven.com.br/api/v4/uol/messages");

    getServerMessagesPromise.then( ( {data} )=>{

        const messageBox = document.querySelector(".messages-box");

        data.forEach( message => {
            messageBox.innerHTML += messageCustomizer(message);     
        });

    });
}

function messageCustomizer( {from, to, text, type, time} ) {
    switch (type) {
        case 'status': 
            return `<div class="msg status">
                        <span class="time">${time}</span>
                        <strong>${from}</strong>
                        ${text}
                    </div>`;

        case 'message':
            return `<div class="msg normal"> 
                        <span class="time">${time}</span>
                        <strong>${from}</strong> para<strong>${to}</strong>:
                        ${text}
                    </div>`;

        case 'private_message':
            return `<div class="msg private">
                        <span class="time">${time}</span>
                        <strong>${from}</strong> reservadamente para<strong>${to}</strong>:
                        ${text}
                    </div>`;

        default :
            break;
    }
}

loadPage();