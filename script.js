// DOM Elements
const heading = document.querySelector("h1");
const featureButtons = document.getElementById("feature-buttons");
const backButton = document.getElementById("back-btn");

// Initialize all features (but keep them hidden initially)
initializePromptFeature();
initializeSummarizationFeature();
initializeDetectFeature();
initializeTranslateFeature();

// Feature Toggle Logic
document.getElementById("prompt-button").addEventListener("click", () => showFeature("Prompt API", "prompt-feature"));
document.getElementById("summary-button").addEventListener("click", () => showFeature("Summarize API", "summary-feature"));
document.getElementById("detect-button").addEventListener("click", () => showFeature("Detect API", "detect-feature"));
document.getElementById("translate-button").addEventListener("click", () => showFeature("Translate API", "translate-feature"));

backButton.addEventListener("click", () => {
  toggleVisibility(backButton, false);
  toggleVisibility(featureButtons, true);
  heading.textContent = "Choose an API Feature";
  toggleVisibility(document.getElementById("prompt-feature"), false);
  toggleVisibility(document.getElementById("summary-feature"), false);
  toggleVisibility(document.getElementById("detect-feature"), false);
  toggleVisibility(document.getElementById("translate-feature"), false);
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

  if (!self.ai || !self.ai.summarizer) {
    alert("Summarization API is unavailable.");
    return;
  }

  submitButton.addEventListener('click', async () => {
    output.textContent = 'Generating summary...'; 

    // Create the summarization session with selected options
    let session = await self.ai.summarizer.create({
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

/** ----------------- DETECT FEATURE ----------------- **/
function initializeDetectFeature() {
  const detectInput = document.getElementById("detect-input");
  const submitButton = document.getElementById("submit-btn-detect");
  const responseOutput = document.getElementById("detect-response-output");

  if (!self.translation) {
    console.error("Detect API not supported");
    return;
  }
  submitButton.addEventListener('click', async () => {
    responseOutput.textContent = 'Detecting language...'; 
    const inputText = detectInput.value.trim();
    
    if (inputText.length === 0) {
      responseOutput.textContent = 'Please enter some text to detect the language.';
      return;
    }
    //Create detector
    const detector = await translation.createDetector();

    // Detect language
    responseOutput.textContent = (await detector.detect(String(detectInput.value).trim()))[0];

    // Display the detected language
    if (results.length > 0) {
      responseOutput.textContent = `Detected language: ${results.language} (Confidence: ${results.confidence})`;
    } else {
      responseOutput.textContent = 'Could not detect the language.';
      console.log('Cannot detect the language');
    }
  });
}

/** ----------------- TRANSLATE FEATURE ----------------- **/
function initializeTranslateFeature() {
  const translateInput = document.getElementById("translate-input");
  const submitButton = document.getElementById("submit-btn-translate");
  const responseOutput = document.getElementById("translate-response-output");
  const translateTo = document.getElementById("translate-to");

  if (!self.translation) {
    console.error("Translation API not supported");
    return;
  }

  submitButton.addEventListener("click", async () => {
    const inputText = translateInput.value.trim();

    if (inputText.length === 0) {
      responseOutput.textContent = "Please enter text to translate.";
      return;
    }

    responseOutput.textContent = "Translating...";

    // Re-initialize languagePair inside the event listener
    const languagePair = {
      sourceLanguage: 'en', 
      targetLanguage: translateTo.value,  // Capture current dropdown value
    };

    try {
      const canTranslate = await translation.canTranslate(languagePair);
      if (canTranslate === "readily") {
        const translator = await translation.createTranslator(languagePair);
        const translated_text = await translator.translate(inputText);
        
        responseOutput.textContent = translated_text; 
        translator.destroy(); // Clean up translator
      } else {
        responseOutput.textContent = "Error: Translation not readily available.";
      }
    } catch (error) {
      responseOutput.textContent = "Error translating. Please try again.";
      console.error("Translation error:", error);
    }
  });
}
