
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const vidaTexto = document.getElementById("vida");
const pontosTexto = document.getElementById("pontos");
const mensagem = document.getElementById("mensagem");

const teclas = {};
let jogador;
let inimigos;
let particulas;
let pontos;
let jogoAtivo;
let ataque;
let tempo;
let camera;
let plataformas;

function iniciarJogo() {
    jogador = {
        x: 80,
        y: 340,
        w: 30,
        h: 42,
        vx: 0,
        vy: 0,
        vida: 5,
        olhando: 1,
        noChao: false,
        invencivel: 0
    };

    plataformas = [
        { x: 0, y: 440, w: 1800, h: 60 },
        { x: 210, y: 365, w: 130, h: 18 },
        { x: 410, y: 305, w: 140, h: 18 },
        { x: 630, y: 365, w: 140, h: 18 },
        { x: 850, y: 310, w: 150, h: 18 },
        { x: 1100, y: 370, w: 160, h: 18 },
        { x: 1380, y: 330, w: 160, h: 18 }
    ];

    inimigos = [
        criarInimigo(300, 398),
        criarInimigo(500, 263),
        criarInimigo(700, 398),
        criarInimigo(920, 268),
        criarInimigo(1180, 398),
        criarInimigo(1450, 288)
    ];

    particulas = [];
    pontos = 0;
    ataque = 0;
    tempo = 0;
    camera = 0;
    jogoAtivo = true;

    vidaTexto.textContent = jogador.vida;
    pontosTexto.textContent = pontos;
    mensagem.textContent = "Explore o reino e derrote os inimigos!";
}

function criarInimigo(x, y) {
    return {
        x, y,
        inicioX: x,
        w: 32,
        h: 32,
        vida: 2,
        direcao: 1,
        vivo: true
    };
}

function apertarTecla(e) {
    const tecla = e.key.toLowerCase();

    if (["arrowleft", "arrowright", "arrowup", " ", "arrowdown"].includes(tecla)) {
        e.preventDefault();
    }

    teclas[tecla] = true;

    if (!jogoAtivo && tecla === "enter") {
        iniciarJogo();
    }

    if (jogoAtivo && (tecla === " " || tecla === "arrowup" || tecla === "w")) {
        if (jogador.noChao) {
            jogador.vy = -12;
            jogador.noChao = false;
        }
    }

    if (jogoAtivo && tecla === "j" && ataque <= 0) {
        ataque = 14;
        atacar();
    }
}

function soltarTecla(e) {
    teclas[e.key.toLowerCase()] = false;
}

window.addEventListener("keydown", apertarTecla);
window.addEventListener("keyup", soltarTecla);

document.getElementById("reiniciar").addEventListener("click", iniciarJogo);

function atacar() {
    for (const inimigo of inimigos) {
        if (!inimigo.vivo) continue;

        const distanciaX = inimigo.x + inimigo.w / 2 -
            (jogador.x + jogador.w / 2);

        const distanciaY = Math.abs(
            (inimigo.y + inimigo.h / 2) -
            (jogador.y + jogador.h / 2)
        );

        if (
            Math.abs(distanciaX) < 65 &&
            distanciaY < 55 &&
            Math.sign(distanciaX || 1) === jogador.olhando
        ) {
            inimigo.vida--;
            inimigo.x += jogador.olhando * 22;

            particulas.push({
                x: inimigo.x + 15,
                y: inimigo.y + 10,
                vida: 12
            });

            if (inimigo.vida <= 0) {
                inimigo.vivo = false;
                pontos += 10;
                pontosTexto.textContent = pontos;
                mensagem.textContent = "Inimigo derrotado! +10 almas";
            }
        }
    }
}

function atualizar() {
    if (!jogoAtivo) return;

    tempo++;

    if (ataque > 0) ataque--;
    if (jogador.invencivel > 0) jogador.invencivel--;

    jogador.vx = 0;

    if (teclas["a"] || teclas["arrowleft"]) {
        jogador.vx = -4;
        jogador.olhando = -1;
    }

    if (teclas["d"] || teclas["arrowright"]) {
        jogador.vx = 4;
        jogador.olhando = 1;
    }

    jogador.x += jogador.vx;
    jogador.x = Math.max(0, Math.min(1760, jogador.x));

    jogador.vy += 0.55;
    jogador.vy = Math.min(jogador.vy, 13);

    const antigoY = jogador.y;
    jogador.y += jogador.vy;
    jogador.noChao = false;

    for (const p of plataformas) {
        const estavaAcima = antigoY + jogador.h <= p.y;
        const atravessou = jogador.y + jogador.h >= p.y;

        if (
            jogador.vy >= 0 &&
            estavaAcima &&
            atravessou &&
            jogador.x + jogador.w > p.x &&
            jogador.x < p.x + p.w
        ) {
            jogador.y = p.y - jogador.h;
            jogador.vy = 0;
            jogador.noChao = true;
        }
    }

    for (const inimigo of inimigos) {
        if (!inimigo.vivo) continue;

        inimigo.x += inimigo.direcao * 1.1;

        if (
            inimigo.x > inimigo.inicioX + 55 ||
            inimigo.x < inimigo.inicioX - 55
        ) {
            inimigo.direcao *= -1;
        }

        const colidiu =
            jogador.x < inimigo.x + inimigo.w &&
            jogador.x + jogador.w > inimigo.x &&
            jogador.y < inimigo.y + inimigo.h &&
            jogador.y + jogador.h > inimigo.y;

        if (colidiu && jogador.invencivel <= 0) {
            jogador.vida--;
            jogador.invencivel = 80;
            jogador.vy = -6;
            jogador.x += jogador.x < inimigo.x ? -20 : 20;

            vidaTexto.textContent = jogador.vida;
            mensagem.textContent = "Você sofreu dano! Cuidado!";

            if (jogador.vida <= 0) {
                jogoAtivo = false;
                mensagem.textContent = "Você caiu no reino esquecido! Pressione Enter ou recomece.";
            }
        }
    }

    if (jogador.y > canvas.height + 100) {
        jogador.vida = 0;
        vidaTexto.textContent = 0;
        jogoAtivo = false;
        mensagem.textContent = "Você caiu no abismo! Pressione Enter ou recomece.";
    }

    camera = Math.max(0, Math.min(900, jogador.x - 250));

    particulas = particulas.filter(p => p.vida > 0);

    for (const p of particulas) {
        p.vida--;
    }

    if (pontos >= 60 && inimigos.every(i => !i.vivo)) {
        mensagem.textContent = "Parabéns! Você limpou esta área do reino!";
    }
}

function desenharCenario() {
    const fundo = ctx.createLinearGradient(0, 0, 0, 500);
    fundo.addColorStop(0, "#111b2c");
    fundo.addColorStop(1, "#26364a");

    ctx.fillStyle = fundo;
    ctx.fillRect(0, 0, 900, 500);

    // Lua
    ctx.fillStyle = "#c7d7e8";
    ctx.beginPath();
    ctx.arc(720 - camera * 0.08, 95, 36, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#182436";
    ctx.beginPath();
    ctx.arc(735 - camera * 0.08, 83, 34, 0, Math.PI * 2);
    ctx.fill();

    // Silhuetas das montanhas
    ctx.fillStyle = "#182536";

    for (let i = 0; i < 12; i++) {
        const x = i * 150 - (camera * 0.25 % 150);

        ctx.beginPath();
        ctx.moveTo(x, 440);
        ctx.lineTo(x + 75, 180 + (i % 3) * 35);
        ctx.lineTo(x + 150, 440);
        ctx.fill();
    }

    // Partículas no ar
    ctx.fillStyle = "#8da8c8";

    for (let i = 0; i < 28; i++) {
        const x = (i * 137 + tempo * 0.3) % 900;
        const y = (i * 73) % 420;

        ctx.globalAlpha = 0.3 + Math.sin(tempo * 0.04 + i) * 0.2;
        ctx.fillRect(x, y, 2, 2);
    }

    ctx.globalAlpha = 1;
}

function desenharPlataformas() {
    for (const p of plataformas) {
        const x = p.x - camera;

        if (x > 920 || x + p.w < -20) continue;

        ctx.fillStyle = "#101722";
        ctx.fillRect(x, p.y, p.w, p.h);

        ctx.fillStyle = "#536b81";
        ctx.fillRect(x, p.y, p.w, 4);

        ctx.fillStyle = "#2b3d51";

        for (let i = 0; i < p.w; i += 24) {
            ctx.fillRect(x + i, p.y + 9, 12, 3);
        }
    }
}

function desenharJogador() {
    const x = jogador.x - camera;
    const y = jogador.y;

    if (jogador.invencivel > 0 && Math.floor(tempo / 5) % 2 === 0) {
        return;
    }

    ctx.save();
    ctx.translate(x + jogador.w / 2, y);

    if (jogador.olhando < 0) ctx.scale(-1, 1);

    // Corpo
    ctx.fillStyle = "#dce7f3";
    ctx.beginPath();
    ctx.ellipse(0, 25, 13, 17, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cabeça
    ctx.beginPath();
    ctx.ellipse(0, 10, 16, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Chifres
    ctx.fillStyle = "#e8eef7";
    ctx.beginPath();
    ctx.moveTo(-12, 4);
    ctx.lineTo(-17, -5);
    ctx.lineTo(-5, 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(12, 4);
    ctx.lineTo(17, -5);
    ctx.lineTo(5, 2);
    ctx.fill();

    // Olhos
    ctx.fillStyle = "#101827";
    ctx.fillRect(-9, 9, 5, 8);
    ctx.fillRect(4, 9, 5, 8);

    // Capa
    ctx.fillStyle = "#4d6685";
    ctx.beginPath();
    ctx.moveTo(-10, 23);
    ctx.lineTo(10, 23);
    ctx.lineTo(14, 40);
    ctx.lineTo(-12, 40);
    ctx.fill();

    // Espada durante o ataque
    if (ataque > 0) {
        ctx.strokeStyle = "#d9f0ff";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(10, 23);
        ctx.lineTo(37, 14);
        ctx.stroke();

        ctx.strokeStyle = "#8dcaff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(12, 23, 30, -1, 0.7);
        ctx.stroke();
    }

    ctx.restore();
}

function desenharInimigos() {
    for (const inimigo of inimigos) {
        if (!inimigo.vivo) continue;

        const x = inimigo.x - camera;
        const y = inimigo.y;

        ctx.fillStyle = "#11151e";
        ctx.beginPath();
        ctx.ellipse(x + 16, y + 18, 17, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#e7f3ff";
        ctx.fillRect(x + 5, y + 12, 6, 5);
        ctx.fillRect(x + 21, y + 12, 6, 5);

        ctx.fillStyle = "#7f9fbd";
        ctx.fillRect(x + 4, y + 29, 8, 4);
        ctx.fillRect(x + 21, y + 29, 8, 4);
    }
}

function desenharParticulas() {
    for (const p of particulas) {
        ctx.globalAlpha = p.vida / 12;
        ctx.fillStyle = "#a9d8ff";
        ctx.fillRect(p.x - camera, p.y, 5, 5);
    }

    ctx.globalAlpha = 1;
}

function desenhar() {
    desenharCenario();

    ctx.save();
    desenharPlataformas();
    desenharInimigos();
    desenharParticulas();
    desenharJogador();
    ctx.restore();

    if (!jogoAtivo) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.textAlign = "center";
        ctx.fillStyle = "#e6efff";
        ctx.font = "bold 34px Georgia";
        ctx.fillText("FIM DE JOGO", 450, 225);

        ctx.font = "18px Georgia";
        ctx.fillText("Pressione ENTER para tentar novamente", 450, 270);
    }
}

function loop() {
    atualizar();
    desenhar();
    requestAnimationFrame(loop);
}

iniciarJogo();
loop();
