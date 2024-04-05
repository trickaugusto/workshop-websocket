let socket;

function connectWebSocket() {
  socket = new WebSocket(WS_URL);

  socket.addEventListener("open", handleSocketOpen);
  socket.addEventListener("message", handleSocketMessage);
  socket.addEventListener("error", handleSocketError);
  socket.addEventListener("close", handleSocketClose);
}

function handleSocketOpen() {
  console.log("Websocket conectado.");
  socket.send(JSON.stringify({ action: ACTIONS.ADMIN }));
}

function handleSocketMessage(event) {
  const data = JSON.parse(event.data);

  if (data.action === ACTIONS.CLIENT_COUNT_UPDATE) {
    updateClientCount(data.count);
  }
}

function handleSocketError(error) {
  console.error("Erro no Websocket:", error);
}

function handleSocketClose() {
  console.log("Websocket fechado. Tentando reconectar em 5 segundos...");
  setTimeout(connectWebSocket(), 5000);
}

function updateClientCount(count) {
  document.getElementById("clientCount").innerText = count;
}

function generateCode(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

connectWebSocket();

const drawButton = document.getElementById("draw");
const messageDiv = document.getElementById("message");

drawButton.addEventListener("click", handleDrawClick);

const premios = getPremios();

function handleDrawClick() {
  const confirmationCode = generateCode(4);
  const premio = null;

  //const premioDiv = document.getElementById("premios");
  const premioDiv = document.getElementsByName("premio");
  premioDiv.forEach((premio) => {
    if (premio.checked) {
      const premioValue = premio.value;
      premio = premioValue;
      console.log(premioValue, premios[premioValue]);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            action: ACTIONS.DRAW,
            code: confirmationCode,
            premio: premioValue,
            nomePremio: premios[premioValue],
          })
        );
        displayConfirmationCode(confirmationCode);
      } else {
        console.warn(
          "Websocket não está aberto. Aguarde e tente novamente em instantes."
        );
      }
    }
  });

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        action: ACTIONS.DRAW,
        code: confirmationCode,
        premio: premio,
      })
    );
    displayConfirmationCode(confirmationCode);
  } else {
    console.warn(
      "Websocket não está aberto. Aguarde e tente novamente em instantes."
    );
  }
}

function displayConfirmationCode(code) {
  messageDiv.innerText = code;
  messageDiv.classList.remove("hide-message");
  messageDiv.classList.add("show-message");
  drawButton.innerText = "Sorteado!";
}

function getPremios() {
  const premios = {
    1: "Smartphone",
    2: "Notebook",
    3: "Tablet",
    4: "Smartwatch",
  }

  const premiosDiv = document.getElementById("premios");

  for (const [key, value] of Object.entries(premios)) {
    const premioDiv = document.createElement("div");
    premioDiv.innerHTML = `<input type="radio" name="premio" value="${key}"> <label for="${value}" >${value}</label>`;
    premiosDiv.appendChild(premioDiv);
  }

  return premios;
}
