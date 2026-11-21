# AIR GESTURE 3D — Full Project

A browser-based 3D hand-interaction application using Three.js and MediaPipe Hand Landmarker. It runs locally and does not require a paid API key or a backend server.

## Included features
- Premium liquid-glass responsive interface.
- Three.js 3D viewport, lighting, floating particles and orbit controls.
- Nine built-in geometries plus GLB/GLTF import.
- Live webcam access through the browser.
- MediaPipe Hand Landmarker, 21 landmarks per detected hand, up to two hands.
- Geometry-based open-palm, pinch, fist, pointing and two-hand gesture classification.
- Pinch object grab/move, palm movement, rotation, two-hand zoom and two-hand rotation.
- Two-hand pinch translation (two-hand grab behavior).
- Rotation, movement, grab, zoom and free interaction modes.
- Camera device picker, mirrored preview, landmark overlay.
- Color, material, scale and sensitivity controls.
- Local browser settings persistence.
- Camera shutdown and recoverable error messages.

## Important requirements
- Node.js 20 LTS recommended (Node.js 18+ generally works with this Vite setup).
- npm (included with Node.js).
- Modern Chrome or Edge.
- Webcam.
- Internet connection for MediaPipe runtime/model CDN download.
- Open through `http://localhost` or HTTPS. Do not open `index.html` using `file://`.

## Windows / macOS / Linux
1. Install Node.js LTS from https://nodejs.org/
2. Extract the ZIP file.
3. Open a terminal in the `AIR-GESTURE-3D` folder.
4. Install packages:
   ```bash
   npm install
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open the URL Vite prints, usually `http://localhost:5173`.
7. Click **Start camera**, grant camera permission, then click **Enable tracking**.

To create a production build:
```bash
npm run build
```
The deployable website is generated in `dist/`.

## Android phone using Termux
1. Install Termux from its official source: https://github.com/termux/termux-app
2. Open Termux and run:
   ```bash
   pkg update && pkg upgrade -y
   pkg install nodejs-lts unzip -y
   ```
   If `nodejs-lts` is not available in your Termux repository:
   ```bash
   pkg install nodejs unzip -y
   ```
3. Allow access to shared storage:
   ```bash
   termux-setup-storage
   ```
4. Download the project ZIP to your phone's Downloads folder.
5. In Termux:
   ```bash
   cd ~/storage/downloads
   unzip AIR-GESTURE-3D.zip
   cd AIR-GESTURE-3D
   npm install
   npm run dev
   ```
6. Open `http://localhost:5173` in Chrome on the same phone.
7. Allow camera permission, tap **Start camera**, then **Enable tracking**.

Keep the Termux session and browser tab active while testing. Some Android devices may throttle background tabs or may not support GPU delegate performance well. If the AI model fails on mobile, try a laptop/desktop Chrome browser.

## Gesture guide
- **Pinch:** thumb and index fingertip close together. Grab/move the object; in Rotation mode, pinch movement rotates.
- **Open palm:** move the object in Movement mode; rotate in Rotation or Free mode.
- **Fist:** temporarily pauses hand-driven object movement.
- **Two hands:** change distance to zoom. In Free/Rotation mode, change the line angle between hands to rotate around Z and move the pair to rotate/move according to mode.
- **Two-hand grab:** pinch with both hands and move both hands to translate the object.

Gesture recognition is geometry-based, not a cloud AI service. Detection quality depends on camera angle, lighting, distance and the user's hand pose.

## Deploy with HTTPS
Run `npm run build`, then upload the contents of `dist/` to a static hosting provider that serves HTTPS. Examples include Netlify, Vercel or GitHub Pages. For GitHub Pages, configure Vite's `base` option if the app is hosted under a repository subpath. Camera access requires HTTPS on public hosting.

## Known limitations
- This is a substantial working project starter, but it has not been certified or tested on every Android handset, webcam, GPU or browser.
- Gesture classification uses heuristic landmark geometry and may occasionally misclassify poses. Adjust lighting, show the whole hand and keep it inside the camera frame.
- The two-hand grab is implemented as two-hand pinch translation; it is not a physics-based grasp simulation.
- Two-hand zoom scales the selected object rather than moving the 3D camera's focal length.
- Imported GLTF files with external textures/buffers should be packaged with their dependencies; GLB is the easiest single-file format.
- MediaPipe files are downloaded from CDN endpoints; internet is needed when they are not cached.
- The camera picker is populated after camera permission is granted because browsers often hide device labels until permission is given.
- No login, backend, paid API key or personal data upload is required by this project. The camera stream is processed in the browser by MediaPipe.
