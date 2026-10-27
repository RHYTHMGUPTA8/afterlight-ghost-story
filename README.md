# Afterlight — No Ollama version

An offline-first supernatural story studio. It runs as a static website and uses Transformers.js to load the open-weight `Xenova/flan-t5-small` model directly in the browser. No Python, Flask, Ollama, API key, or backend server is required.

## Run it

1. Extract the ZIP.
2. Open a terminal in the extracted folder.
3. Run a simple local static server (recommended because browser modules may not work from `file://`):
   ```bash
   py -m http.server 8000
   ```
4. Open http://localhost:8000.

VS Code users can also use the Live Server extension and click **Go Live**.

## First run

The browser needs internet access on the first run to download Transformers.js and the model files. The first load can take a while. After the files are cached, inference runs in your browser; exact offline behavior depends on whether all assets have been cached and your browser settings.

If the model fails to load or your device cannot run it, the app automatically uses a built-in story fallback. The fallback is not AI-generated. The UI labels which mode produced the result.

## Why this is open AI

- `Xenova/flan-t5-small` is an open-weight model package for browser inference.
- Transformers.js runs inference client-side, so prompts are not sent to a hosted inference API by this application.
- No Ollama install or cloud inference key is required.
- The model can be changed by editing `MODEL_ID` in `static/app.js`; verify model license and task compatibility before switching.

## Notes for challenge submission

Do not claim model generation worked until you test it on your target browser/device. Mention that the first run needs internet to fetch the model, and local performance depends on device resources. For a reliable live demo, test it ahead of time and keep the fallback ready.
