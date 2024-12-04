// DOM Elements
const heading = document.querySelector("h1");
const featureButtons = document.getElementById("feature-buttons");
const backButton = document.getElementById("back-btn");

// Initialize all features (but keep them hidden initially)
initializePromptFeature();
initializeSummarizationFeature();
initializeDetectFeature();
initializeTranslateFeature();
initializeWriteFeature();
initializeRewriteFeature();

// Feature Toggle Logic
document.getElementById("prompt-button").addEventListener("click", () => showFeature("Prompt API", "prompt-feature"));
document.getElementById("summary-button").addEventListener("click", () => showFeature("Summarize API", "summary-feature"));
// document.getElementById("detect-button").addEventListener("click", () => showFeature("Detect API", "detect-feature"));
document.getElementById("translate-button").addEventListener("click", () => showFeature("Translate API", "translate-feature"));
document.getElementById("write-button").addEventListener("click", () => showFeature("Write API", "write-feature"));
document.getElementById("rewrite-button").addEventListener("click", () => showFeature("Rewrite API", "rewrite-feature-2"));

backButton.addEventListener("click", () => {
  toggleVisibility(backButton, false);
  toggleVisibility(featureButtons, true);
  heading.textContent = "Choose an API Feature";
  toggleVisibility(document.getElementById("prompt-feature"), false);
  toggleVisibility(document.getElementById("summary-feature"), false);
  toggleVisibility(document.getElementById("detect-feature"), false);
  toggleVisibility(document.getElementById("translate-feature"), false);
  toggleVisibility(document.getElementById("write-feature"), false);
  toggleVisibility(document.getElementById("rewrite-feature-2"), false);
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
let savedPromptInput = "";
let savedPromptResponse = "";
function initializePromptFeature() {
  const promptInput = document.getElementById("prompt-input");
  const submitButton = document.getElementById("submit-btn-prompt");
  const responseOutput = document.getElementById("prompt-response-output");
  document.querySelector("#prompt-feature button#clear").addEventListener("click", () => {
    promptInput.value = "";
    responseOutput.textContent = "";
  });

  if (!self.ai || !self.ai.languageModel) {
    console.error("Prompt API not supported");
    return;
  }

  self.ai.languageModel.create({ temperature: 0.7, topK: 2 }).then(session => {
    submitButton.addEventListener("click", async () => {
      const prompt = promptInput.value.trim();
      if (!prompt) return;

      try {
        const stream = await session.promptStreaming(prompt);
        for await (const chunk of stream){
          responseOutput.textContent = chunk.trim();
        }
        savedPromptInput = promptInput.value;
        savedPromptResponse = responseOutput.textContent;
      } catch (error) {
        console.error("Error:", error);
        responseOutput.textContent = "Error generating response.";
      }
    });
  });
}

/** ----------------- SUMMARIZATION FEATURE ----------------- **/
let savedSummaryInput = "";
let savedSummaryResponse = "";
function initializeSummarizationFeature() {
  const inputTextArea = document.getElementById("summary-input");
  const summaryTypeSelect = document.getElementById("summary-type");
  const summaryFormatSelect = document.getElementById("summary-format");
  const summaryLengthSelect = document.getElementById("summary-length");
  const output = document.getElementById("summary-response-output");
  const submitButton = document.getElementById("submit-btn-summary");
  document.querySelector("#summary-feature button#clear").addEventListener("click", () => {
    inputTextArea.value = "";
    output.textContent = "";
  });

  if (!self.ai || !self.ai.summarizer) {
    alert("Summarization API is unavailable.");
    return;
  }

  submitButton.addEventListener('click', async () => {
    // Create the summarization session with selected options
    let session = await self.ai.summarizer.create({
      type: summaryTypeSelect.value,
      format: summaryFormatSelect.value,
      length: summaryLengthSelect.value
    });
    
    try {
        const stream = await session.summarizeStreaming(inputTextArea.value);
        for await (const chunk of stream) {
          output.textContent = chunk.trim();
        }
        savedSummaryInput = inputTextArea.value;
        savedSummaryResponse = output.textContent;
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
  document.querySelector("#detect-feature button#clear").addEventListener("click", () => {
    detectInput.value = "";
    responseOutput.textContent = "";
  });

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
  const useSavedResponseCheckbox = document.getElementById("use-saved-response");
  document.querySelector("#translate-feature button#clear").addEventListener("click", () => {
    translateInput.value = "";
    responseOutput.textContent = "";
  });

  if (!self.translation) {
    console.error("Translation API not supported");
    return;
  }
  document.querySelectorAll('input[name="response-source"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const selectedSource = document.querySelector('input[name="response-source"]:checked').value;
      if (selectedSource === "prompt") {
        translateInput.value = savedPromptResponse;
      } else if (selectedSource === "summary") {
        translateInput.value = savedSummaryResponse;
      } else {
        translateInput.value = translateInput.value; 
        translateInput.placeholder = "Enter text to translate...";
      }
    });
  });

  submitButton.addEventListener("click", async () => {
    let inputText = translateInput.value.trim();

    if (inputText.length === 0) {
      responseOutput.textContent = "Please enter text to translate.";
      return;
    }
    responseOutput.textContent = "Translating...";
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
        translator.destroy();
      } else {
        responseOutput.textContent = "Error: Translation not readily available.";
      }
    } catch (error) {
      responseOutput.textContent = "Error translating. Please try again.";
      console.error("Translation error:", error);
    } 
  });
}

/** ----------------- WRITE+REWRITE FEATURE ----------------- **/
function initializeWriteFeature() {
  const inputTextArea = document.getElementById("write-input");
  const contextInput = document.getElementById("context");
  const responseOutput = document.getElementById("write-response-output");
  const submitWriteButton = document.getElementById("submit-btn-write");
  const submitRewriteButton = document.getElementById("submit-btn-rewrite");
  const rewriteToneSelect = document.getElementById("rewrite-tone");
  const rewriteLengthSelect = document.getElementById("rewrite-length");
  const rewriteSection = document.getElementById("rewrite-feature");
  document.querySelector("#write-feature button#clear").addEventListener("click", () => {
    inputTextArea.value = "";
    responseOutput.textContent = "";
  });

  if (!self.ai || !self.ai.writer) {
    alert("Writer API is unavailable.");
    return;
  } 
  if (!self.ai.rewriter) {
    alert("Rewriter API is unavaianble");
    return;
  } 

  submitWriteButton.addEventListener('click', async () => {
    const prompt = inputTextArea.value.trim();
    const context = contextInput.value.trim();
    if (!prompt){
      responseOutput.textContent = "Please enter a prompt."
      return;
    }
    writer = await self.ai.writer.create({
      tone: "neutral",
      length: "medium",
      format: "plain-text",
      sharedContext: context,
    });
    responseOutput.textContent = 'Generating...'; 
    try{  
      const stream = await writer.writeStreaming(prompt, {sharedContext : context});
      responseOutput.textContent = "";
      for await (const chunk of stream){
        responseOutput.textContent = chunk.trim();
      }
      writer.destroy();
      rewriteSection.style.display = "block";
    } catch (error) {
      responseOutput.textContent = "Error generating response. Please try again with a new prompt or context";
      console.error("Writer error:", error);
    }
  });


  submitRewriteButton.addEventListener('click', async () =>{
    const prompt = responseOutput.textContent;
    const context = contextInput.value.trim();
    if (!prompt){
      responseOutput.textContent = "No text to rewrite";
      return;
    }
    responseOutput.textContent = "Rewriting...";
    rewriter = await self.ai.rewriter.create({
      tone: rewriteToneSelect.value,
      length: rewriteLengthSelect.value,
      format: "as-is",
      sharedContext: context,
    });
    try{
      const stream = await rewriter.rewriteStreaming(prompt);
      for await (const chunk of stream){
        responseOutput.textContent = chunk.trim();
      }
      // const result = await rewriter.rewrite(prompt);
      // responseOutput.textContent = "";
      // responseOutput.textContent = result;
      rewriter.destroy();
    } catch(error){
        responseOutput.textContent = "Error rewriting text.  Please try again with a new prompt or different settings";
        console.error("Rewriter error:", error);
    }
    
  })
}

/** ----------------- REWRITE FEATURE ----------------- **/
function initializeRewriteFeature() {
  const rewriteInput = document.getElementById("rewrite-input");
  const rewriteTone = document.getElementById("rewrite-tone-2");
  const rewriteLength = document.getElementById("rewrite-length-2");
  const submitRewriteButton = document.getElementById("submit-btn-rewrite-2");
  const rewriteResponseOutput = document.getElementById("rewrite-response-output");
  const context = document.getElementById("context-2");
  // Handle source switching
  document.querySelectorAll('input[name="rewrite-source"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const selectedSource = document.querySelector('input[name="rewrite-source"]:checked').value;

      if (selectedSource === "prompt") {
        context.value = savedPromptInput;
        rewriteInput.value = savedPromptResponse;
      } else if (selectedSource === "summary") {
        context.value = savedSummaryInput;
        rewriteInput.value = savedSummaryResponse;
      } else {
        context.value = "I am trying to understand the text better."
        rewriteInput.value = "";
        rewriteInput.placeholder = "Enter text to rewrite...";
      }
    });
  });

  // Handle rewriting logic
  submitRewriteButton.addEventListener("click", async () => {
    const textToRewrite = rewriteInput.value.trim();
    const context = document.getElementById("context-2").value.trim();

    if (!textToRewrite) {
      rewriteResponseOutput.textContent = "Please enter or select text to rewrite.";
      return;
    }

    if (!self.ai || !self.ai.rewriter) {
      console.error("Rewriter API not supported.");
      rewriteResponseOutput.textContent = "Rewriter API unavailable.";
      return;
    }

    const rewriter = await self.ai.rewriter.create({
      tone: rewriteTone.value,
      length: rewriteLength.value,
      format: "as-is",
      sharedContext: context,
    });

    let result = "";
    try {
      rewriteResponseOutput.textContent = "Rewriting...";
      const stream = await rewriter.rewriteStreaming(textToRewrite);
      for await (const chunk of stream) {
        result = chunk.trim();
      }
      rewriteResponseOutput.textContent = "";
      rewriteResponseOutput.textContent = result;

    } catch (error) {
      console.error("Rewriter error:", error);
      rewriteResponseOutput.textContent = "Error rewriting. Please try again.";
      rewriter.destroy()
    }
  });
}
