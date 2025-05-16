async function buscarAtivo(event) {
    if (event) event.preventDefault();

    const ticker = document.getElementById('ativo').value.toUpperCase();
    const nomeEl = document.getElementById('resultado-nome');
    const descEl = document.getElementById('resultado-descricao');
    const cotacaoEl = document.getElementById('cotacao-valor');
    const cotacaoResultadoEl = document.getElementById('cotacao-resultado');

    if (!ticker) {
        nomeEl.textContent = 'Digite um código de ativo.';
        descEl.textContent = '';
        cotacaoEl.textContent = '';
        cotacaoResultadoEl.textContent = '';
        return;
    }

    try {
        const url = `https://brapi.dev/api/quote/${ticker}?token=sNii9yqjBHdKgVZHfosnXW`;
        const res = await fetch(url);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            nomeEl.textContent = 'Erro: resposta inesperada da API.';
            descEl.textContent = '';
            cotacaoEl.textContent = '';
            cotacaoResultadoEl.textContent = '';
            return;
        }
        const data = await res.json();

        if (data.results && data.results.length > 0) {
            const ativo = data.results[0];
            nomeEl.textContent = ativo.symbol || '';
            descEl.textContent = ativo.longName || 'Nome não disponível';
            cotacaoEl.textContent = ativo.regularMarketPrice
                ? `R$ ${ativo.regularMarketPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                : 'Cotação não disponível';

            // Removido o bloco do P/VP (priceToBook)
            cotacaoResultadoEl.textContent = '';
        } else {
            nomeEl.textContent = 'Ativo não encontrado.';
            descEl.textContent = '';
            cotacaoEl.textContent = '';
            cotacaoResultadoEl.textContent = '';
        }
    } catch (error) {
        nomeEl.textContent = 'Erro ao buscar ativo.';
        descEl.textContent = '';
        cotacaoEl.textContent = '';
        cotacaoResultadoEl.textContent = '';
        console.error(error);
    }
}
