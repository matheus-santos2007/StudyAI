const aiPrompt = document.getElementById("aiPrompt");
const aiResponse = document.getElementById("aiResponse");
const generateQuiz = document.getElementById("generateQuiz");

generateQuiz.addEventListener("click", createQuiz);

function createQuiz() {
    const tema = aiPrompt.value.trim();

    if (!tema) {
        aiResponse.innerHTML = "Digite um tema primeiro!";
        return;
    }

    const question = `O que melhor descreve ${tema}?`;

    const correct = `Explicação correta sobre ${tema}`;

    const options = [
        correct,
        "Alternativa incorreta 1",
        "Alternativa incorreta 2",
        "Alternativa incorreta 3"
    ];

    options.sort(() => Math.random() - 0.5);

    let html = `<h3>Quiz sobre ${tema}</h3>`;
    html += `<p>${question}</p><br>`;

    options.forEach(opt => {
        html += `
            <button onclick="checkAnswer('${opt}', '${correct}')">
                ${opt}
            </button><br><br>
        `;
    });

    aiResponse.innerHTML = html;
}

function checkAnswer(selected, correct) {
    if (selected === correct) {
        aiResponse.innerHTML += "<p>✅ Acertou!</p>";
    } else {
        aiResponse.innerHTML += "<p>❌ Errou!</p>";
    }
}