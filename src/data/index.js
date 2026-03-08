import { validateAnimePayload } from '../utils/validateSchema'
import aot from './aot.json'

// Add one import per new anime universe
// import hxh from "./hxh.json";
// import jjk from "./jjk.json";

export const ANIME_LIST = [
  aot,
  // hxh, jjk
]

// Validate all loaded payloads
ANIME_LIST.forEach(validateAnimePayload)
