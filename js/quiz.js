// OBS: não redeclaramos aiPrompt/aiResponse aqui (eles já existem no groq.js,
// que é carregado antes deste arquivo). Declará-los de novo com "const"
// causava um SyntaxError ("Identifier has already been declared") que
// quebrava o quiz.js inteiro silenciosamente — era por isso que o botão
// "Gerar Quiz" não funcionava.
const quizThemeInput = document.getElementById("aiPrompt");
const quizOutput = document.getElementById("aiResponse");
const generateQuizBtn = document.getElementById("generateQuiz");

generateQuizBtn.addEventListener("click", createQuiz);

async function createQuiz() {
    const tema = quizThemeInput.value.trim();

    if (!tema) {
        quizOutput.innerHTML = "Digite um tema primeiro!";
        return;
    }

    // GROQ_API_KEY é declarada em groq.js (carregado antes deste arquivo)
    if (!GROQ_API_KEY) {
        quizOutput.innerHTML = "Chave Groq não configurada. Verifique a configuração no HTML ou no backend.";
        return;
    }

    quizOutput.innerHTML = "Gerando quiz...";
    generateQuizBtn.disabled = true;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    {
                        role: "system",
                        content: `Você é um gerador de quiz educacional para estudantes do ensino médio.

REGRAS OBRIGATÓRIAS:
- Responda SOMENTE com um JSON válido, sem texto antes ou depois, sem markdown, sem crases (\`\`\`).
- O JSON deve seguir EXATAMENTE este formato:
{"question": "pergunta sobre o tema", "options": ["opção 1", "opção 2", "opção 3", "opção 4"], "correctIndex": 0, "explanation": "explicação curta da resposta correta"}
- "options" deve ter exatamente 4 itens, todos plausíveis (sem opções absurdas ou genéricas como "alternativa incorreta").
- "correctIndex" é o índice (0 a 3) da opção correta dentro do array "options".
- A pergunta e as opções devem ser SOMENTE sobre o tema enviado pelo usuário, nunca genéricas.
- Não inclua letras (A, B, C, D) dentro do texto das opções.`
                    },
                    {
                        role: "user",
                        content: `Gere uma pergunta de múltipla escolha sobre: ${tema}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 400
            })
        });

        const data = await response.json();
        console.log("Groq (quiz):", data);

        if (!response.ok) {
            const serverError = (data && data.error && data.error.message) || (data && data.message) || response.statusText;
            throw new Error(serverError || "Erro desconhecido na API Groq");
        }

        let raw = "";
        if (data.choices && data.choices[0] && data.choices[0].message) {
            raw = data.choices[0].message.content;
        }

        const quiz = parseQuizJSON(raw);

        if (!quiz) {
            quizOutput.innerHTML = "<p>Não consegui gerar o quiz. Tente novamente.</p>";
            return;
        }

        renderQuiz(tema, quiz);

    } catch (error) {
        console.error("Erro Groq (quiz):", error);
        quizOutput.innerHTML = "<p>Erro ao gerar quiz. Tente novamente.</p>";
    } finally {
        generateQuizBtn.disabled = false;
    }
}

// Extrai e valida o JSON retornado pela IA (removendo crases de markdown, se vierem)
function parseQuizJSON(raw) {
    if (!raw) return null;

    let cleaned = raw.trim();
    cleaned = cleaned.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();

    try {
        const quiz = JSON.parse(cleaned);

        if (
            !quiz.question ||
            !Array.isArray(quiz.options) ||
            quiz.options.length !== 4 ||
            typeof quiz.correctIndex !== "number" ||
            quiz.correctIndex < 0 ||
            quiz.correctIndex > 3
        ) {
            console.error("JSON do quiz veio com formato inválido:", quiz);
            return null;
        }

        return quiz;
    } catch (err) {
        console.error("Resposta da IA não é um JSON válido:", cleaned);
        return null;
    }
}

function renderQuiz(tema, quiz) {
    let html = `<h3>Quiz sobre ${escapeHTML(tema)}</h3>`;
    html += `<p>${escapeHTML(quiz.question)}</p><br>`;

    quiz.options.forEach((opt, index) => {
        html += `<button class="quiz-option" data-index="${index}">${escapeHTML(opt)}</button><br><br>`;
    });

    html += `<div id="quizFeedback"></div>`;

    quizOutput.innerHTML = html;

    const buttons = quizOutput.querySelectorAll(".quiz-option");

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            buttons.forEach(b => b.disabled = true);

            const selectedIndex = Number(btn.dataset.index);
            const feedback = document.getElementById("quizFeedback");
            const correctBtn = buttons[quiz.correctIndex];

            if (selectedIndex === quiz.correctIndex) {
                btn.style.background = "#16a34a";
                feedback.innerHTML = "<p>✅ Acertou!</p>";
            } else {
                btn.style.background = "#dc2626";
                correctBtn.style.background = "#16a34a";
                feedback.innerHTML = `<p>❌ Errou! A resposta correta era: "${escapeHTML(quiz.options[quiz.correctIndex])}"</p>`;
            }

            if (quiz.explanation) {
                feedback.innerHTML += `<p style="margin-top:10px;opacity:0.8;">${escapeHTML(quiz.explanation)}</p>`;
            }
        });
    });
}

// Evita injeção de HTML no texto vindo da IA
function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
}
