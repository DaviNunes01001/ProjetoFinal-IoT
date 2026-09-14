let arEmAlerta = false;

function atualizarAr(co2) {
    const co2Numerico = Number(co2);
    const co2Texto = document.getElementById("air");
    const alerta = document.getElementById("alerta-Ar");

    if (!Number.isFinite(co2Numerico)) {
        return;
    }

    co2Texto.textContent = co2Numerico;

    const arRuim = co2Numerico >= 1000;
    alerta.textContent = arRuim
        ? "⚠️ Qualidade de Ar Ruim"
        : "";

    arEmAlerta = arRuim;
}