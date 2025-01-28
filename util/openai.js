const axios = require("axios");
const openAiKey = process.env.OPEN_AI_KEY;

//OpenAi Function
async function chatgpt(transcript) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${openAiKey}`,
  };

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `You are a workout assistant, here is a transcript from a workout video "${transcript}", condense it down into a list of key steps and return the steps in the following json format e.g. ["10 push ups", "3 squats"] - return only json, do not include any explainer text or markdown formatting`,
        },
      ],
    },
    { headers }
  );
  const reply = response.data.choices[0].message.content;
  return reply;
}

module.exports = chatgpt;
