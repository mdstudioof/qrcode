import { GoogleGenAI } from "@google/genai";

export interface BiographyParams {
  name: string;
  relationship: string;
  dates: string;
  memories: string;
}

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateBiography = async (data: BiographyParams): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `
      Escreva uma biografia curta, emocionante e respeitosa (cerca de 150 palavras) para um memorial digital.
      
      Dados da pessoa:
      Nome: ${data.name}
      Relação com quem escreve: ${data.relationship}
      Datas (Nascimento/Falecimento): ${data.dates}
      Memórias principais/Características: ${data.memories}

      O tom deve ser de celebração da vida, saudade e amor. Use parágrafos claros.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "Não foi possível gerar a biografia no momento.";
  } catch (error) {
    console.error("Error generating biography:", error);
    return "Ocorreu um erro ao conectar com a IA. Por favor, tente novamente mais tarde.";
  }
};