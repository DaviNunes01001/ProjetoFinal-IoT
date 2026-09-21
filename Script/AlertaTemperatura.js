let temperaturaEmAlerta = false;

function atualizarTemperatura(temperatura) {
    const temperaturaNumerica = Number(temperatura);
    const temperaturaTexto = document.getElementById("temp");
    const alerta = document.getElementById("alerta-Temperatura");

    if (!Number.isFinite(temperaturaNumerica)) {
        return;
    }

    temperaturaTexto.textContent = temperaturaNumerica;

    salvarUltimoValor("temperatura", temperaturaNumerica);

    const temperaturaAlta = temperaturaNumerica >= 30;
    alerta.textContent = temperaturaAlta
        ? "⚠️ Temperatura alta"
        : "";

    temperaturaEmAlerta = temperaturaAlta;
}