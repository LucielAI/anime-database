import { validateAnimePayload } from '../utils/validateSchema'
import aot from './aot.json'
import jjk from './jjk.json'

export const ANIME_LIST = [
  aot,
  jjk
]

// Validate all loaded payloads
ANIME_LIST.forEach(validateAnimePayload)
