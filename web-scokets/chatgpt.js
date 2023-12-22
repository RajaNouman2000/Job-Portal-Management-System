import axios from "axios";
import dotenv from "dotenv";
// Load environment variables from .env file
dotenv.config();

export const makeRequest = async (req, res) => {
  try {
    const openaiEndpoint = "https://api.openai.com/v1/chat/completions";
    const openaiApiKey = process.env.OPENAISECRETKEY; 

    const response = await axios.post(
      openaiEndpoint,
      {
        messages: [{ role: "user", content: req.body.question }],
        model: "gpt-3.5-turbo",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );
    // console.log("API Response:", response.data.choices[0].message.content);
      return response.data.choices[0].message.content
  } catch (error) {
    console.error("Error:", error.message);
  }
};

export default { makeRequest };
