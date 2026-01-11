import { COMPRESSION_PRESETS, CompressionPresetName } from "./FormFlux.Types";
import zlib from "zlib";
export default  function compress(buff: Buffer, presetName: CompressionPresetName): Buffer {
    const config = COMPRESSION_PRESETS[presetName];
    return zlib.gzipSync(buff, { level: config.level, memLevel: config.memLevel });
}