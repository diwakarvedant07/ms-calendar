class NotifyBox {
  constructor({socketServer, socketEventName = [], JwtToken }) {
    this.targetBox = document.getElementById("NotifyBox")
    this.socketServer = socketServer;
    this.socketEventName = socketEventName;
    this.JwtToken = JwtToken;
  }

  startSockets = () => {
    //starting tp listen to SocketEvents
    const socket = io(this.socketServer);
    socket.on("connect_error", (err) => {
      console.log("connect_error: ", err);
    });
    socket.on("connect", () => {
      console.log("connected");
    });
    // creating listeners for each event-name.
    this.socketEventName.forEach((eventName) => {
        socket.on(eventName, (data) => {
          this.createNotificationCard(data);
        })
    })
    socket.on("message",(data) => {
      console.log(data);
    });

    this.getData = () => {
      socket.emit("notification", this.JwtToken)
    }
    socket.on("notification-count", (data) => {
      document.getElementById("notification-button").innerHTML += (" : " + data);
      document.getElementById("offcanvasExampleLabel").innerHTML += (" : " + data);
    })

    this.getData();

    this.setHasSeenTrue = (id) => {
      socket.emit("setHasSeenTrue", id)
      let element = document.getElementById("cardId "+ id);
      element.remove();

    } 
  }

  createNotificationCard (myEvent) {
    let newDate = (new Date(myEvent.sdate)).toISOString().split("T");
    let card = document.createElement("div");
    card.innerHTML = `<div id="cardId ${myEvent._id}" class="d-flex flex-row mw-100 mh-100" style="
              width: 300px;
              height: 100px; 
              margin-left: 50px; 
              margin-top: 10px; 
              background-color: ${myEvent.eventColor};
              box-shadow: 5px 5px 5px 2px grey;
              " >
              <div id="card-content" class="bg-white" style="margin-left: 5px; margin-top: 5px; height: 95px; width: 245px;">
              <h3>${myEvent.eveName}</h3>
              <h7>${myEvent.eveDes}</h7><br>
              <h8>${newDate[0] + " : " + newDate[1].split(".000Z")[0]}</h8>
              </div>
              <div id="card-options" class="d-flex bg-white justify-content-center" style="width: 50px; margin-top: 5px;">
              <button id="setHasSeenTrue ${myEvent._id}" class="btn-close bg-danger" value="${myEvent._id}"></button>
              </div>   
              </div>`;
    document.getElementById("NotifyBoxBody").appendChild(card);
    let element = document.getElementById("setHasSeenTrue " +myEvent._id);
    element.addEventListener("click", () => {
      this.setHasSeenTrue(myEvent._id);
    })
  }

  render = () => {
    //console.log(this.targetBox)
    let notifyElement = document.createElement("div");
    //notify element inner html
    {
    notifyElement.innerHTML = `
    <button class="btn btn-primary" id="notification-button" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">notifications
    </button>
    
    <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="offcanvasExampleLabel">Notifications</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body" id="NotifyBoxBody"> 
      </div>
    </div>
    `;
  }
    this.targetBox.appendChild(notifyElement);
    this.lazyLoad();
    this.startSockets();

  }

  lazyLoad = () => {
    document.getElementById("NotifyBoxBody").addEventListener("scroll", (info) => {
    //console.log("this is it", info.target.scrollHeight - info.target.clientHeight , " == " , (info.target.scrollTop));
    if (info.target.scrollHeight - info.target.clientHeight == (info.target.scrollTop)){
      this.getData();
    }
  });


  }

  
}

//export default NotifyBox;
