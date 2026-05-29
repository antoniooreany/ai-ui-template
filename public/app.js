document.getElementById('send').addEventListener('click', async () => {
    const prompt = document.getElementById('prompt').value;
    const resultDiv = document.getElementById('result');
    resultDiv.innerText = 'Loading...';

    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
    });
    const data = await response.json();
    resultDiv.innerText = data.text || data.error;
});
