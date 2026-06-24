const aiPrompt = document.getElementById("aiPrompt");
const askAI = document.getElementById("askAI");
const aiResponse = document.getElementById("aiResponse");

const groqMeta = document.querySelector('meta[name="groq-api-key"]');
const GROQ_API_KEY = (groqMeta && groqMeta.content && groqMeta.content.trim()) || window.GROQ_API_KEY || "";

askAI.addEventListener("click", askGroq);

async function askGroq() {
    const prompt = aiPrompt.value.trim();

    if (!prompt) {
        alert("Digite uma pergunta!");
        return;
    }

    if (!GROQ_API_KEY) {
        aiResponse.innerHTML = "Chave Groq não configurada. Verifique a configuração no HTML ou no backend.";
        return;
    }

    aiResponse.innerHTML = "Pensando...";

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{
                    role: "system",
                    content: `
Você é o StudyAI, um tutor extremamente rigoroso.

REGRAS OBRIGATÓRIAS:
- Responda SOMENTE ao tema enviado pelo usuário
- NÃO invente cursos, módulos ou aulas genéricas
- NÃO escreva "bem-vindo ao curso"
- NÃO mude o assunto em hipótese alguma
- NÃO use placeholders como [inserir tema]
- NÃO crie estrutura de curso
- Se o tema for "fotossíntese", fale APENAS disso

FORMATO:
1. Título direto do tema
2. Explicação objetiva
3. Exemplo real
4. Resumo curto final

Estilo: didático, direto, nível ensino médio.

Explique diretamente sobre: ${prompt}
`
                }],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        const data = await response.json();
        console.log("Groq:", data);

        if (!response.ok) {
            const serverError = (data && data.error && data.error.message) || (data && data.message) || response.statusText;
            throw new Error(serverError || "Erro desconhecido na API Groq");
        }

        let answer = "Erro ao gerar resposta";

        if (
            data.choices &&
            data.choices[0] &&
            data.choices[0].message
        ) {
            answer = data.choices[0].message.content;
        }

        aiResponse.innerHTML = `<p>${answer}</p>`;

    } catch (error) {
        console.error("Erro Groq:", error);
        aiResponse.innerHTML = "Erro ao conectar com IA";
    }
}