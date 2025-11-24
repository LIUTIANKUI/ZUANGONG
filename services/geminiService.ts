import { GoogleGenAI, Content, Part } from "@google/genai";
import { Message } from "../types";

const SYSTEM_INSTRUCTION = `
You are "Lao Li" (老李), a senior technical application engineer at a cutting tool factory. 
Your factory produces: Taps (丝锥), Drills (钻头), Dies (板牙), Knurling Wheels/Cutters (滚滑轮/滚花刀).

Target Audience: You are chatting on WeChat with long-term, loyal customers ("Old Friends").

Tone & Style Guidelines:
1.  **Casual & Familiar**: Use terms like "王总" (President Wang), "张工" (Engineer Zhang), "兄弟" (Brother), "咱家" (Our factory). 
2.  **Professional**: You are an expert. Identify machining problems quickly (wear, breakage, wrong speed/feed).
3.  **Concise**: Mimic instant messaging. Short paragraphs. Don't write long emails.
4.  **Helpful**: Always try to solve the problem or recommend the right tool specification.
5.  **Emoji Use**: Occasionally use simple emojis like 🤝, 👍, 👌, 🙏 to be polite.

Key Scenarios:
- If they ask about broken taps, ask about material hardness and cutting fluid.
- If they send a picture, assume it's a tool failure or a workpiece defect and analyze it.
- If they ask for price, say you'll ask the finance girl to send a quote, but confirm specs first.

Remember: You are in a WeChat chat. Keep it natural.
`;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Convert our app's Message format to Gemini's Content format for history
const formatHistory = (messages: Message[]): Content[] => {
  return messages.map((m) => ({
    role: m.sender === 'me' ? 'model' : 'user',
    parts: m.type === 'image' && m.imageUrl 
      ? [
          { text: m.text || "Shared an image" }, // Fallback text if strictly image
          // Note: In a real production app we'd need to manage the image tokens carefully. 
          // For this demo, we assume the immediate previous context is sufficient or we handle current turn with image.
          // Historical images in 'chats' can be complex. We will simplify by treating history text-heavy 
          // and only sending the *current* image as a fresh part.
        ]
      : [{ text: m.text }],
  }));
};

export const generateReply = async (
  currentMessage: string, 
  historyMessages: Message[], 
  imageBase64?: string, 
  mimeType: string = 'image/jpeg'
): Promise<string> => {
  
  try {
    // 1. Prepare history (excluding the message we are just about to send, as that goes into 'message')
    // We limit history to last 15 turns to save tokens and keep context fresh
    const recentHistory = historyMessages.slice(-15);
    const formattedHistory = formatHistory(recentHistory);

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: formattedHistory,
    });

    // 2. Prepare the message payload
    let messageParts: Part[] = [];

    if (imageBase64) {
      // Strip header if present (e.g., "data:image/jpeg;base64,")
      const cleanBase64 = imageBase64.split(',')[1];
      messageParts.push({
        inlineData: {
          mimeType: mimeType,
          data: cleanBase64
        }
      });
    }

    if (currentMessage) {
      messageParts.push({ text: currentMessage });
    } else if (imageBase64) {
      messageParts.push({ text: "请帮我看看这个图片里的问题 (Please analyze this image)" });
    }

    // 3. Send
    const result = await chat.sendMessage({
      message: messageParts
    });

    return result.text || "Receive empty response.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "哎呀，网络有点卡，刚才没听清。再说一遍？(Network error)";
  }
};