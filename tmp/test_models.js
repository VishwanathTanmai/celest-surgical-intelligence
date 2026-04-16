const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testModels() {
  const API_KEY = "AIzaSyDK8iGxdd0eG5uLagqbBAV4vW6UXVMvW9g";
  const genAI = new GoogleGenerativeAI(API_KEY);
  const modelsToTest = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro",
    "gemini-1.0-pro",
    "gemini-2.0-flash-exp",
    "gemini-2.5-flash"
  ];

  for (const modelName of modelsToTest) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("test");
      console.log(`- ${modelName}: SUCCESS`);
    } catch (error) {
      console.log(`- ${modelName}: FAILED (${error.message})`);
    }
  }
}

testModels();
