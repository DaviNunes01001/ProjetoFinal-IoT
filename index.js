// --- CONFIGURAÇÕES DE CONEXÃO ---
// O ESP32 usa MQTT TCP na porta 1883; o navegador usa WebSocket na 9001.
const MQTT_HOST = "10.0.0.252";
const MQTT_PORT = 9001;

// Tópicos exatos publicados pelo ESP32
const TOPIC_TEMP = "matheus/temperatura";
const TOPIC_HUM = "matheus/umidade";
const TOPIC_AIR = "matheus/gas";
const SENSOR_STORAGE_KEY = "iot:ultimosValoresSensores";

function salvarUltimoValor(sensor, valor) {
  const valorNumerico = Number(valor);

  if (!Number.isFinite(valorNumerico)) {
    return;
  }

  try {
    const valoresSalvos = JSON.parse(
      localStorage.getItem(SENSOR_STORAGE_KEY) || "{}"
    );
    valoresSalvos[sensor] = valorNumerico;
    localStorage.setItem(SENSOR_STORAGE_KEY, JSON.stringify(valoresSalvos));
  } catch (error) {
    console.warn("Não foi possível salvar os valores dos sensores.", error);
  }
}

function restaurarUltimosValores() {
  try {
    const valoresSalvos = JSON.parse(
      localStorage.getItem(SENSOR_STORAGE_KEY) || "{}"
    );

    if (Number.isFinite(Number(valoresSalvos.temperatura))) {
      atualizarTemperatura(valoresSalvos.temperatura);
    }

    if (Number.isFinite(Number(valoresSalvos.umidade))) {
      document.getElementById("hum").textContent = valoresSalvos.umidade;
    }

    if (Number.isFinite(Number(valoresSalvos.ar))) {
      atualizarAr(valoresSalvos.ar);
    }
  } catch (error) {
    console.warn("Não foi possível restaurar os valores dos sensores.", error);
  }
}

// Criação do ID de Cliente único para o navegador
const clientID = "WebDash_" + Math.random().toString(16).substr(2, 8);

// Inicializa o cliente MQTT Paho
const client = new Paho.MQTT.Client(MQTT_HOST, Number(MQTT_PORT), clientID);

// Callbacks do cliente
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// Conecta ao broker
client.connect({
  onSuccess: onConnect,
  onFailure: onFailure,
});

function onConnect() {
  const statusDiv = document.getElementById("status");
  statusDiv.innerText = "Status: Conectado ao Mosquitto";
  statusDiv.className = "status connected";

  // Assina os tópicos após conectar com sucesso
  client.subscribe(TOPIC_TEMP);
  client.subscribe(TOPIC_HUM);
  client.subscribe(TOPIC_AIR);
}

function onFailure(responseObject) {
  const statusDiv = document.getElementById("status");
  statusDiv.innerText =
    "Status: Falha na conexão com " +
    MQTT_HOST +
    ":" +
    MQTT_PORT +
    " (" +
    (responseObject.errorMessage || "verifique o WebSocket do Mosquitto") +
    ")";
  statusDiv.className = "status disconnected";
}

function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    const statusDiv = document.getElementById("status");
    statusDiv.innerText = "Status: Conexão Perdida";
    statusDiv.className = "status disconnected";
  }
}

// Processa as mensagens recebidas nos tópicos assinados
function onMessageArrived(message) {
  const topic = message.destinationName;
  const payload = message.payloadString;

  if (topic === TOPIC_TEMP) {
    atualizarTemperatura(payload);
  } else if (topic === TOPIC_HUM) {
    const umidadeNumerica = Number(payload);

    if (Number.isFinite(umidadeNumerica)) {
      document.getElementById("hum").textContent = umidadeNumerica;
      salvarUltimoValor("umidade", umidadeNumerica);
    }
  } else if (topic === TOPIC_AIR) {
    atualizarAr(payload);
  }
}

restaurarUltimosValores();
