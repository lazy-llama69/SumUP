(async () => {
    const promptInput = document.getElementById("prompt-input");
    const submitButton = document.getElementById("submit-btn");
    const responseOutput = document.getElementById("response-output");
  
    // Ensure Prompt API is available
    if (!self.ai || !self.ai.languageModel) {
      console.error("Prompt API not supported");
      return;
    }
  
    // Create session with specific settings for temperature and top-k
    let session = await self.ai.languageModel.create({
      temperature: 0.7,
      topK: 2,
    });
  
    // Function to send the prompt to the API and display the response
    const submitPrompt = async () => {
      const prompt = promptInput.value.trim();
      if (!prompt) {
        console.log("No prompt entered");
        return;
      }
  
      responseOutput.textContent = "Generating response...";
  
      try {
        // const stream = await session.promptStreaming(prompt);
        // let response = "";
  
        // // Stream and display the response
        // for await (const chunk of stream) {
        //   response += chunk.trim();
        //   responseOutput.textContent = response; // update response in real-time
        // }
        const result = await session.prompt(prompt);
        responseOutput.textContent = result.trim(); // Display the result
      } catch (error) {
        console.error("Error:", error);
        responseOutput.textContent = "Error generating response.";
      }
    };
  
    // Handle the submit button click
    submitButton.addEventListener("click", submitPrompt);
  })();
  