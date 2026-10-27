import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2";
env.allowLocalModels = false;
env.useBrowserCache = true;

// Small open-weight text-to-text model. It downloads from Hugging Face on first use.
const MODEL_ID = "Xenova/flan-t5-small";
let generatorPromise = null;
const $ = id => document.getElementById(id);
const theme = $("theme"), mood = $("mood"), length = $("length");
$("memoryToggle").addEventListener("change", () => $("memoryFields").classList.toggle("hidden", !$("memoryToggle").checked));
document.querySelectorAll(".chip").forEach(btn => btn.addEventListener("click", () => {theme.value=btn.dataset.theme;theme.focus();}));

function fallbackStory(topic, mood, memory) {
  const opening = [
    `At the edge of the town stood a place everyone had forgotten: ${topic.toLowerCase()}.`,
    `The first sign was the silence. Even the wind seemed afraid to approach ${topic.toLowerCase()}.`,
    `Nobody spoke about it after sunset, but everyone knew the story of ${topic.toLowerCase()}.`
  ][Math.floor(Math.random()*3)];
  const memoryLine = memory ? ` In the quiet, a familiar detail returned: ${memory}. It felt less like a haunting than a small light left on for someone coming home.` : "";
  return `The Last Light\\n\\n${opening} The air tasted of rain and old paper. At midnight, a single light appeared behind the dusty glass. It did not flicker; it waited.\\n\\nA sound drifted through the dark, soft as a name remembered just before waking. The door opened by itself. Beyond it was not a room, but a long corridor lined with photographs whose faces had been carefully rubbed away.\\n\\nAt the far end, a shadow raised one hand. There was no threat in the gesture, only recognition. For one impossible second, the whole building glowed with the warmth of a home that had been empty for years.${memoryLine}\\n\\nWhen morning came, the light was gone. On the sill lay a fresh marigold, still bright with dew.`;
}
function parseStory(text) {
  let cleaned = (text || "").trim().replace(/^["']|["']$/g,"");
  const lines = cleaned.split("\n").filter(x=>x.trim());
  if(lines.length > 1 && lines[0].length < 90) return {title:lines[0].replace(/^#+\s*/,""),body:cleaned.slice(cleaned.indexOf(lines[1])).trim()};
  return {title:"The Thing That Remained",body:cleaned};
}
async function getGenerator() {
  if (!generatorPromise) {
    generatorPromise = pipeline("text2text-generation", MODEL_ID, {
      progress_callback: p => {
        if (p.status === "progress" && p.total) $("loadingText").textContent = `Loading model · ${Math.round(p.progress)}%`;
        else if (p.status === "downloading") $("loadingText").textContent = "Downloading the model into your browser...";
      }
    });
  }
  return generatorPromise;
}
$("generate").addEventListener("click", async () => {
  const topic = theme.value.trim();
  if (!topic) { theme.focus(); return; }
  const memory = $("memoryToggle").checked ? $("memoryNote").value.trim() : "";
  $("emptyState").classList.add("hidden"); $("storyOutput").classList.add("hidden"); $("loadingState").classList.remove("hidden");
  $("generate").disabled = true;
  let story, engine = "BROWSER FALLBACK";
  try {
    $("loadingText").textContent = "Waking the open-weight model...";
    const generator = await getGenerator();
    const words = length.value === "short" ? 100 : length.value === "medium" ? 180 : 260;
    const prompt = `Write an original ${mood.value} supernatural short story, around ${words} words, based on this premise: ${topic}. ${memory ? "Respectfully include this remembrance as fiction, without claiming to contact a real deceased person: "+memory+"." : ""} Use vivid sensory detail and a memorable ending. Start with a short title.`;
    const result = await generator(prompt, { max_new_tokens: length.value==="short" ? 140 : length.value==="medium" ? 240 : 320, do_sample: true, temperature: 0.9 });
    story = result?.[0]?.generated_text?.trim();
    if (!story || story.length < 60) throw new Error("Model returned too little text");
    engine = `IN-BROWSER OPEN MODEL · ${MODEL_ID}`;
  } catch (error) {
    console.warn("Browser model unavailable; using local fallback.", error);
    story = fallbackStory(topic, mood.value, memory);
    engine = "BUILT-IN FALLBACK · MODEL UNAVAILABLE";
  }
  const parsed = parseStory(story);
  $("storyTitle").textContent = parsed.title;
  $("storyText").textContent = parsed.body;
  $("engineLabel").textContent = engine;
  $("loadingState").classList.add("hidden"); $("storyOutput").classList.remove("hidden");
  $("generate").disabled = false;
});
$("copyBtn").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText($("storyTitle").textContent+"\\n\\n"+$("storyText").textContent); $("copyBtn").textContent="Copied ✓"; }
  catch { $("copyBtn").textContent="Select and copy"; }
  setTimeout(()=>$("copyBtn").textContent="Copy story ↗",1800);
});