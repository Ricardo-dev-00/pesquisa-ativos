async function buscarAtivo(event) {
    if (event) event.preventDefault();

    const tickerInput = document.getElementById('ativo');
    const ticker = tickerInput.value.toUpperCase().trim();
    const nomeEl = document.getElementById('resultado-nome');
    const descEl = document.getElementById('resultado-descricao');
    const setorEl = document.getElementById('resultado-setor');
    const cotacaoEl = document.getElementById('cotacao-valor');
    const cotacaoResultadoEl = document.getElementById('cotacao-resultado');
    const lookingIcon = document.querySelector('.looking-icon');

    if (!ticker) {
        nomeEl.textContent = 'Digite um código de ativo.';
        descEl.textContent = '';
        setorEl.textContent = '';
        cotacaoEl.textContent = '';
        cotacaoResultadoEl.textContent = '';
        lookingIcon.style.display = 'inline-block'; // mostra ícone se nada digitado
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

            // Logo do ativo
            const logoEl = document.getElementById('resultado-logo');
            if (ativo.logourl) {
                logoEl.src = ativo.logourl;
                logoEl.style.display = 'inline-block';
            } else {
                logoEl.style.display = 'none';
            }

            nomeEl.textContent = ativo.symbol || '';
            setorEl.textContent = summary.sector ? `Setor: ${summary.sector}` : 'Setor não disponível';

            descEl.innerHTML = summary.website
                ? `<a href="${summary.website}" target="_blank" rel="noopener noreferrer">${summary.website}</a>`
                : 'Website não disponível';

            cotacaoEl.textContent = (typeof ativo.regularMarketPrice === 'number')
                ? `R$ ${ativo.regularMarketPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                : 'Cotação não disponível';

            cotacaoResultadoEl.textContent = '';

            const resultado = {
                symbol: ativo.symbol,
                price: ativo.regularMarketPrice,
                sector: summary.sector,
                website: summary.website,
                displayName: ativo.symbol,
                displaySetor: setorEl.textContent,
                displayDescricao: descEl.innerHTML,
                logoUrl: ativo.logourl || ''
            };

            localStorage.setItem('ultimaBusca', JSON.stringify(resultado));
            adicionarAoHistorico(ativo.symbol);
            renderizarHistorico();
            tickerInput.value = '';

            lookingIcon.style.display = 'none'; // esconde ícone pois tem busca
        } else {
            nomeEl.textContent = 'Ativo não encontrado.';
            descEl.textContent = '';
            setorEl.textContent = '';
            cotacaoEl.textContent = '';
            cotacaoResultadoEl.textContent = '';

            const logoEl = document.getElementById('resultado-logo');
            logoEl.style.display = 'none';

            lookingIcon.style.display = 'inline-block'; // mostra ícone pois não encontrou ativo
        }
    } catch (error) {
        console.error('Erro ao buscar ativo:', error);
        nomeEl.textContent = 'Erro ao buscar ativo.';
        descEl.textContent = '';
        setorEl.textContent = '';
        cotacaoEl.textContent = '';
        cotacaoResultadoEl.textContent = '';

        const logoEl = document.getElementById('resultado-logo');
        logoEl.style.display = 'none';

        lookingIcon.style.display = 'inline-block'; // mostra ícone em caso de erro
    }
}

function adicionarAoHistorico(ticker) {
    let historico = JSON.parse(localStorage.getItem('historicoBusca')) || [];

    historico = historico.filter(item => item.toUpperCase() !== ticker.toUpperCase());
    historico.unshift(ticker);

    if (historico.length > 8) {
        historico = historico.slice(0, 8);
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

window.addEventListener('DOMContentLoaded', () => {
    renderizarHistorico();

    const ultimaBusca = localStorage.getItem('ultimaBusca');
    const lookingIcon = document.querySelector('.looking-icon');

    if (ultimaBusca) {
        const dados = JSON.parse(ultimaBusca);

        const logoEl = document.getElementById('resultado-logo');
        if (dados.logoUrl) {
            logoEl.src = dados.logoUrl;
            logoEl.style.display = 'inline-block';
        } else {
            logoEl.style.display = 'none';
        }

        document.getElementById('resultado-nome').textContent = dados.displayName || '';
        document.getElementById('resultado-setor').textContent = dados.displaySetor || '';
        document.getElementById('resultado-descricao').innerHTML = dados.displayDescricao || '';
        document.getElementById('cotacao-valor').textContent = dados.price
            ? `R$ ${dados.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            : 'Cotação não disponível';
        document.getElementById('cotacao-resultado').textContent = '';

        lookingIcon.style.display = 'none'; // já tem busca, esconde ícone
    } else {
        lookingIcon.style.display = 'inline-block'; // sem busca, mostra ícone
    }
});