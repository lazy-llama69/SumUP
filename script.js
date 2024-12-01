// DOM Elements
const heading = document.querySelector("h1");
const featureButtons = document.getElementById("feature-buttons");
const backButton = document.getElementById("back-btn");

// Initialize both features (but keep them hidden initially)
initializePromptFeature();
initializeSummarizationFeature();

// Feature Toggle Logic
document.getElementById("prompt-button").addEventListener("click", () => showFeature("Prompt API", "prompt-feature"));
document.getElementById("summary-button").addEventListener("click", () => showFeature("Summarize API", "summary-feature"));

backButton.addEventListener("click", () => {
  toggleVisibility(backButton, false);
  toggleVisibility(featureButtons, true);
  heading.textContent = "Choose an API Feature";
  toggleVisibility(document.getElementById("prompt-feature"), false);
  toggleVisibility(document.getElementById("summary-feature"), false);
});

// Show feature-specific section and update UI
function showFeature(title, featureId) {
  heading.textContent = title;
  toggleVisibility(featureButtons, false);
  toggleVisibility(backButton, true);
  toggleVisibility(document.getElementById(featureId), true);
}

// Utility to toggle visibility
function toggleVisibility(element, show) {
  element.style.display = show ? "block" : "none";
}

/** ----------------- PROMPT FEATURE ----------------- **/
function initializePromptFeature() {
  const promptInput = document.getElementById("prompt-input");
  const submitButton = document.getElementById("submit-btn-prompt");
  const responseOutput = document.getElementById("prompt-response-output");

  if (!self.ai || !self.ai.languageModel) {
    console.error("Prompt API not supported");
    return;
  }

  self.ai.languageModel.create({ temperature: 0.7, topK: 2 }).then(session => {
    submitButton.addEventListener("click", async () => {
      const prompt = promptInput.value.trim();
      if (!prompt) return;

      responseOutput.textContent = "Generating response...";
      try {
        const result = await session.prompt(prompt);
        responseOutput.textContent = result.trim();
      } catch (error) {
        console.error("Error:", error);
        responseOutput.textContent = "Error generating response.";
      }
    });
  });
}

/** ----------------- SUMMARIZATION FEATURE ----------------- **/
function initializeSummarizationFeature() {
  const inputTextArea = document.getElementById("summary-input");
  const summaryTypeSelect = document.getElementById("summary-type");
  const summaryFormatSelect = document.getElementById("summary-format");
  const summaryLengthSelect = document.getElementById("summary-length");
  const output = document.getElementById("summary-response-output");
  const submitButton = document.getElementById("submit-btn-summary");

  if (!window.ai || !window.ai.summarizer) {
    alert("Summarization API is unavailable.");
    return;
  }

  submitButton.addEventListener('click', async () => {
    output.textContent = 'Generating summary...'; 

    // Create the summarization session with selected options
    let session = await window.ai.summarizer.create({
      type: summaryTypeSelect.value,
      format: summaryFormatSelect.value,
      length: summaryLengthSelect.value
    });
    
    try {
        const summary = await session.summarize(inputTextArea.value);
        output.textContent = summary; 
    } catch (error) {
        output.textContent = 'Error summarizing text'; 
        console.error(error);
    }
    session.destroy(); 
  });

}
