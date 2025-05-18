async function buscarAtivo(event) {
    if (event) event.preventDefault();

    const tickerInput = document.getElementById('ativo');
    const ticker = tickerInput.value.toUpperCase().trim();
    const nomeEl = document.getElementById('resultado-nome');
    const descEl = document.getElementById('resultado-descricao');
    const setorEl = document.getElementById('resultado-setor');
    const cotacaoEl = document.getElementById('cotacao-valor');
    const cotacaoResultadoEl = document.getElementById('cotacao-resultado');

    if (!ticker) {
        nomeEl.textContent = 'Digite um código de ativo.';
        descEl.textContent = '';
        setorEl.textContent = '';
        cotacaoEl.textContent = '';
        cotacaoResultadoEl.textContent = '';
        return;
    }

    nomeEl.textContent = 'Buscando...';
    descEl.textContent = '';
    setorEl.textContent = '';
    cotacaoEl.textContent = '';
    cotacaoResultadoEl.textContent = '';

    try {
        const url = `https://brapi.dev/api/quote/${ticker}?modules=summaryProfile&token=sNii9yqjBHdKgVZHfosnXW`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.results && data.results.length > 0) {
            const ativo = data.results[0];
            const summary = ativo.summaryProfile || {};

            nomeEl.textContent = ativo.symbol || '';
            setorEl.textContent = summary.sector ? `Setor: ${summary.sector}` : 'Setor não disponível';

            descEl.innerHTML = summary.website
                ? `<a href="${summary.website}" target="_blank" rel="noopener noreferrer">${summary.website}</a>`
                : 'Website não disponível';

            cotacaoEl.textContent = (typeof ativo.regularMarketPrice === 'number')
                ? `R$ ${ativo.regularMarketPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                : 'Cotação não disponível';

            cotacaoResultadoEl.textContent = '';

            // Salva o objeto completo no ultimaBusca
            const resultado = {
                symbol: ativo.symbol,
                price: ativo.regularMarketPrice,
                sector: summary.sector,
                website: summary.website,
                displayName: ativo.symbol,
                displaySetor: setorEl.textContent,
                displayDescricao: descEl.innerHTML
            };

            localStorage.setItem('ultimaBusca', JSON.stringify(resultado));
            adicionarAoHistorico(ativo.symbol);  // só ticker no histórico
            renderizarHistorico();
            tickerInput.value = '';

        } else {
            nomeEl.textContent = 'Ativo não encontrado.';
            descEl.textContent = '';
            setorEl.textContent = '';
            cotacaoEl.textContent = '';
            cotacaoResultadoEl.textContent = '';
        }
    } catch (error) {
        console.error('Erro ao buscar ativo:', error);
        nomeEl.textContent = 'Erro ao buscar ativo.';
        descEl.textContent = '';
        setorEl.textContent = '';
        cotacaoEl.textContent = '';
        cotacaoResultadoEl.textContent = '';
    }
}

function adicionarAoHistorico(ticker) {
    let historico = JSON.parse(localStorage.getItem('historicoBusca')) || [];

    historico = historico.filter(item => item.toUpperCase() !== ticker.toUpperCase());
    historico.unshift(ticker);

    if (historico.length > 6) {
        historico = historico.slice(0, 6);
    }

    localStorage.setItem('historicoBusca', JSON.stringify(historico));
}

function renderizarHistorico() {
    const lista = document.getElementById('lista-recentes');
    lista.innerHTML = '';

    const historico = JSON.parse(localStorage.getItem('historicoBusca')) || [];

    historico.forEach(ticker => {
        const span = document.createElement('span');
        span.className = 'chip';
        span.textContent = ticker;
        span.onclick = () => {
            document.getElementById('ativo').value = ticker;
            buscarAtivo(); // busca e atualiza o resultado
        };
        lista.appendChild(span);
    });
}

function limparHistorico() {
    localStorage.removeItem('historicoBusca');
    renderizarHistorico();
}

// Ao carregar a página, renderiza histórico e carrega ultima busca
window.addEventListener('DOMContentLoaded', () => {
    renderizarHistorico();

    const ultimaBusca = localStorage.getItem('ultimaBusca');
    if (ultimaBusca) {
        const dados = JSON.parse(ultimaBusca);
        document.getElementById('resultado-nome').textContent = dados.displayName || '';
        document.getElementById('resultado-setor').textContent = dados.displaySetor || '';
        document.getElementById('resultado-descricao').innerHTML = dados.displayDescricao || '';
        document.getElementById('cotacao-valor').textContent = dados.price
            ? `R$ ${dados.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            : 'Cotação não disponível';
        document.getElementById('cotacao-resultado').textContent = '';
    }
});