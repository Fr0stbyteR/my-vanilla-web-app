import { instantiateFaustModule, LibFaust, FaustCompiler, FaustMonoDspGenerator } from "@grame/faustwasm/dist/esm-bundle";

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
process = ba.pulsen(1, 10000) : pm.djembe(60, 0.3, 0.4, 1);
`;
  // Compile the DSP
  await generator.compile(compiler, name, code, argv.join(" "));
  const node = await generator.createNode(audioContext);
  node.connect(audioContext.destination);
};
