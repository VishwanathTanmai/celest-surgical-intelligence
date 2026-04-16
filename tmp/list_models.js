const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const API_KEY = "AIzaSyDK8iGxdd0eG5uLagqbBAV4vW6UXVMvW9g";
  const genAI = new GoogleGenerativeAI(API_KEY);
  try {
    const result = await genAI.listModels();
    console.log("Available Models:");
    result.models.forEach(m => {
      console.log(`- ${m.name} (${m.supportedGenerationMethods.join(", ")})`);
    });
  } catch (error) {
    console.error("Error listing models:", error.message);
  }
}

listModels();
