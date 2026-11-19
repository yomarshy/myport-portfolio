COSMOS — Universe Simulator (Alpha 01)

RUN:
1. Extract this folder and open it in VS Code.
2. Start a local web server in this folder.
   Option A: VS Code Live Server
   Option B: python -m http.server 5500
3. Open http://127.0.0.1:5500

Do not open index.html directly with file:// because JavaScript modules need HTTP.

CONTROLS:
- Left mouse drag: rotate
- Right mouse drag: pan
- Mouse wheel: zoom
- Click a galaxy: inspect it
- Pause: stop gentle galaxy rotation
- Reset camera: return to start

Requires internet to load Three.js from jsDelivr and the optional Google font.
Galaxy positions, star counts and distances are procedural values, not measured astronomical data.
