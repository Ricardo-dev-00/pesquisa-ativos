async function buscarAtivo(event) {
    if (event) event.preventDefault();

    const ticker = document.getElementById('ativo').value.toUpperCase();
    const nomeEl = document.getElementById('resultado-nome');
    const descEl = document.getElementById('resultado-descricao');
    const setorEl = document.getElementById('resultado-setor');
    const cotacaoEl = document.getElementById('cotacao-valor');
    const cotacaoResultadoEl = document.getElementById('cotacao-resultado');

    if (!ticker) {
        console.log('Nenhum ticker digitado');
        nomeEl.textContent = 'Digite um código de ativo.';
        descEl.textContent = '';
        setorEl.textContent = '';
        cotacaoEl.textContent = '';
        cotacaoResultadoEl.textContent = '';
        return;
    }

    try {
        const url = `https://brapi.dev/api/quote/${ticker}?modules=summaryProfile&token=sNii9yqjBHdKgVZHfosnXW`;
        console.log('Buscando URL:', url);
        const res = await fetch(url);
        const data = await res.json();
        console.log('Resposta da API:', data);

        if (data.results && data.results.length > 0) {
            const ativo = data.results[0];
            const summary = ativo.summaryProfile || {};

            console.log('Ativo:', ativo);
            console.log('Summary:', summary);

            nomeEl.textContent = ativo.symbol || '';
            setorEl.textContent = summary.sector ? `Setor: ${summary.sector}` : 'Setor não disponível';

            descEl.innerHTML = summary.website
                ? `<a href="${summary.website}" target="_blank" rel="noopener noreferrer">${summary.website}</a>`
                : 'Website não disponível';

            cotacaoEl.textContent = ativo.regularMarketPrice
                ? `R$ ${ativo.regularMarketPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                : 'Cotação não disponível';

            cotacaoResultadoEl.textContent = '';

            const resultado = {
                symbol: ativo.symbol,
                longName: ativo.longName,
                price: ativo.regularMarketPrice,
                sector: summary.sector,
                website: summary.website
            };

            console.log('Salvando no localStorage:', resultado);
            localStorage.setItem('ultimaBusca', JSON.stringify(resultado));

            document.getElementById('ativo').value = '';

        } else {
            console.log('Ativo não encontrado');
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
