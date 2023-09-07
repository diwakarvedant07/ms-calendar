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
    //socket.on("notification-count", (data) => {
    //  document.getElementById("notification-button").innerHTML += (" : " + data);
    //  document.getElementById("offcanvasExampleLabel").innerHTML += (" : " + data);
    //})

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
    card.innerHTML = `<div id="cardId ${myEvent._id}"><a href="#" class="dropdown-item dropdown-item-unread"> 
                <span class="dropdown-item-icon bg-primary text-white"> <i class="fa fa-calendar" style="font-size:16px;color:white"></i></span> 
                <span class="dropdown-item-desc"> ${myEvent.eveName} 
                <span class="time">${newDate[0] + " : " + newDate[1].split(".000Z")[0]}</span>
                </span>
                </a></div>`;
    document.getElementById("NotifyBox").appendChild(card);
    //let element = document.getElementById("setHasSeenTrue " +myEvent._id);
    //element.addEventListener("click", () => {
    //  this.setHasSeenTrue(myEvent._id);
    //})
  }

  render = () => {
    //console.log(this.targetBox)
    this.lazyLoad();
    this.startSockets();

  }

  lazyLoad = () => {
    document.getElementById("NotifyBox").addEventListener("scroll", (info) => {
    //console.log("this is it", info.target.scrollHeight - info.target.clientHeight , " == " , (info.target.scrollTop + 20));
    if (info.target.scrollHeight - info.target.clientHeight < (info.target.scrollTop + 10)){
      this.getData();
    }
  });


  }

  
}

//export default NotifyBox;
