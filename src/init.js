import { instantiateFaustModule, LibFaust, FaustCompiler, FaustMonoDspGenerator } from "@grame/faustwasm/dist/esm-bundle";
import { FilesetResolver, HandLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";

let node;
export const initHandLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks("./wasm");
  const handLandmarker = await HandLandmarker.createFromOptions(
    vision,
    {
      baseOptions: {
        modelAssetPath: "hand_landmarker.task"
      },
      numHands: 2,
      runningMode: "VIDEO"
    }
  );
  console.log(handLandmarker);
  // const devices = await navigator.mediaDevices.enumerateDevices();
  // console.log(devices);
  /** @type {HTMLVideoElement} */
  const video = document.getElementById("camera");
  /** @type {HTMLCanvasElement} */
  const canvasElement = document.getElementById("landmarks");
  const canvasCtx = canvasElement.getContext("2d");
  const drawingUtils = new DrawingUtils(canvasCtx);
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  console.log(stream);  

  let lastVideoTime = -1;
  let results;
  const renderLoop = () => {
    if (video.currentTime !== lastVideoTime) {
      // const timestamp = Date.now();
      const timestamp = performance.now();
      results = handLandmarker.detectForVideo(video, timestamp);
      // processResults(detections);
      // console.log(results);
      if (results && node) {
        if (results.landmarks[0]) {
          node.setParamValue("/Djembe/time", results.landmarks[0][0].x * 9000 + 1000);
        }
      }
      lastVideoTime = video.currentTime;
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    if (results && results.landmarks) {
      for (const landmarks of results.landmarks) {
        drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, { color: "#0000FF", lineWidth: 5 });
        drawingUtils.drawLandmarks(landmarks, { color: "#FFFFFF", lineWidth: 2 });
      }
    }
    canvasCtx.restore();
    requestAnimationFrame(renderLoop);
  }
  video.addEventListener("loadeddata", renderLoop);
  video.srcObject = stream;
  await video.play();
  canvasElement.style.width = video.videoWidth;
  canvasElement.style.height = video.videoHeight;
  canvasElement.width = video.videoWidth;
  canvasElement.height = video.videoHeight;
};

export const init = async () => {
  const faustModule = await instantiateFaustModule();
  // Get the Faust compiler
  const libFaust = new LibFaust(faustModule);
  console.log(libFaust.version());
  const compiler = new FaustCompiler(libFaust);
  const generator = new FaustMonoDspGenerator();
  const audioContext = new AudioContext();
  const sampleRate = audioContext.sampleRate;
  const name = "Djembe";
  const argv = ["-I", "libraries/"];
  const code = `
import("stdfaust.lib");
interval = hslider("time", 10000, 1000, 10000, 1);
process = ba.pulsen(1, interval) : pm.djembe(60, 0.3, 0.4, 1);
`;
  // Compile the DSP
  await generator.compile(compiler, name, code, argv.join(" "));
  node = await generator.createNode(audioContext);
  node.connect(audioContext.destination);
  console.log(node.getParams());
};
