
"use strict";

// ========================================
// PARTE 1 — Arrays e métodos
// ========================================

const pedidos = [
    { cliente: "Bia", valor: 120, status: "pago" },
    { cliente: "Carlos", valor: 80, status: "pendente" },
    { cliente: "Ana", valor: 250.5, status: "pago" },
    { cliente: "", valor: 100, status: "pago" },
    { cliente: "Pedro", valor: -20, status: "pago" }
];

const pedidosValidos = pedidos.filter(pedido =>
    typeof pedido.cliente === "string" &&
    pedido.cliente.trim() !== "" &&
    typeof pedido.valor === "number" &&
    Number.isFinite(pedido.valor) &&
    pedido.valor > 0
);

const pedidosPagos = pedidosValidos.filter(
    pedido => pedido.status === "pago"
);

const totalFaturado = pedidosPagos.reduce(
    (total, pedido) => total + pedido.valor,
    0
);

const textosPedidos = pedidosPagos.map(
    pedido => `${pedido.cliente.trim()} — R$ ${pedido.valor.toFixed(2)}`
);

const ordersTotal = document.querySelector("#orders-total");
const ordersList = document.querySelector("#orders-list");

ordersTotal.textContent =
    `Total faturado: R$ ${totalFaturado.toFixed(2)}`;

textosPedidos.forEach(texto => {
    const item = document.createElement("li");
    item.textContent = texto;
    ordersList.appendChild(item);
});


// ========================================
// PARTE 2 — Buscador de CEP
// ========================================

const cepForm = document.querySelector("#cep-form");
const cepInput = document.querySelector("#cep-input");
const cepButton = document.querySelector("#cep-button");
const cepStatus = document.querySelector("#cep-status");
const cepResult = document.querySelector("#cep-result");
const cepHistoryList = document.querySelector("#cep-history");

const historicoCEPs = [];

cepForm.addEventListener("submit", async event => {
    event.preventDefault();

    const cep = cepInput.value.trim();

    // Aceita somente oito dígitos.
    if (!/^\d{8}$/.test(cep)) {
        cepStatus.textContent = "Digite um CEP válido com 8 dígitos.";
        cepResult.replaceChildren();
        return;
    }

    cepButton.disabled = true;
    cepStatus.textContent = "Buscando...";
    cepResult.replaceChildren();

    try {
        const response = await fetch(
            `https://viacep.com.br/ws/${cep}/json/`,
            { signal: AbortSignal.timeout(5000) }
        );

        if (!response.ok) {
            throw new Error("Falha na conexão.");
        }

        const dados = await response.json();

        if (dados.erro) {
            cepStatus.textContent = "CEP não encontrado.";
            return;
        }

        const campos = [
            ["Rua", dados.logradouro],
            ["Bairro", dados.bairro],
            ["Cidade", dados.localidade],
            ["UF", dados.uf]
        ];

        campos.forEach(([nome, valor]) => {
            const dt = document.createElement("dt");
            const dd = document.createElement("dd");

            dt.textContent = nome;
            dd.textContent = valor || "Não informado";

            cepResult.append(dt, dd);
        });

        cepStatus.textContent = "";

        // Guarda o resultado no histórico.
        historicoCEPs.unshift({
            cep,
            cidade: dados.localidade || "Cidade não informada",
            uf: dados.uf || "--"
        });

        renderizarHistorico();

    } catch (error) {
        if (error.name === "TimeoutError") {
            cepStatus.textContent = "A busca demorou demais. Tente novamente.";
        } else {
            cepStatus.textContent =
                "Falha na conexão. Verifique sua internet e tente novamente.";
        }

        cepResult.replaceChildren();
    } finally {
        cepButton.disabled = false;
    }
});

function renderizarHistorico() {
    cepHistoryList.replaceChildren();

    historicoCEPs.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.cep} — ${item.cidade}/${item.uf}`;
        cepHistoryList.appendChild(li);
    });
}


// ========================================
// PARTE 3 — Mini Pokédex
// ========================================

const pokemonForm = document.querySelector("#pokemon-form");
const pokemonInput = document.querySelector("#pokemon-input");
const pokemonButton = document.querySelector("#pokemon-button");
const pokemonStatus = document.querySelector("#pokemon-status");
const pokemonResult = document.querySelector("#pokemon-result");

pokemonForm.addEventListener("submit", async event => {
    event.preventDefault();

    const nome = pokemonInput.value.trim().toLowerCase();

    if (!nome) {
        pokemonStatus.textContent = "Digite o nome de um Pokémon.";
        pokemonResult.replaceChildren();
        return;
    }

    pokemonButton.disabled = true;
    pokemonStatus.textContent = "Buscando Pokémon...";
    pokemonResult.replaceChildren();

    try {
        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nome)}`,
            { signal: AbortSignal.timeout(5000) }
        );

        if (response.status === 404) {
            pokemonStatus.textContent = "Pokémon não encontrado.";
            return;
        }

        if (!response.ok) {
            throw new Error("Falha na conexão.");
        }

        const pokemon = await response.json();

        const titulo = document.createElement("h3");
        titulo.textContent =
            pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

        const imagem = document.createElement("img");
        imagem.className = "pokemon-img";
        imagem.alt = `Imagem de ${pokemon.name}`;
        imagem.src = pokemon.sprites.front_default || "";
        
        if (!pokemon.sprites.front_default) {
            imagem.alt = "Imagem não disponível";
            imagem.removeAttribute("src");
        }

        const tiposTitulo = document.createElement("p");
        tiposTitulo.textContent = "Tipos:";

        const tiposLista = document.createElement("ul");

        pokemon.types.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item.type.name;
            tiposLista.appendChild(li);
        });

        pokemonResult.append(
            titulo,
            imagem,
            tiposTitulo,
            tiposLista
        );

        pokemonStatus.textContent = "";

    } catch (error) {
        if (error.name === "TimeoutError") {
            pokemonStatus.textContent =
                "A busca demorou demais. Tente novamente.";
        } else {
            pokemonStatus.textContent =
                "Falha na conexão. Verifique sua internet e tente novamente.";
        }

        pokemonResult.replaceChildren();
    } finally {
        pokemonButton.disabled = false;
    }
});