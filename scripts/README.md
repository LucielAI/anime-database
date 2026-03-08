# Anime Architecture Archive - Utilities Hub

This directory contains standalone Python intelligence scripts designed to automate and rigorously enforce the structural data requirements of the V5 Architecture. 

These scripts are explicitly separated from the React codebase as they are strictly **Data Generation** tools, primarily used by the AI or the maintainer during the extraction phase of a new fictional universe.

### 1. `patch_jikan_images.py` (The Jikan Image Enforcer)

**Reason for Existence:** 
The Jikan v4 API's generic `/characters/{id}` endpoint is highly vulnerable to malicious or spoiler-heavy caching by MyAnimeList users (e.g., manga panels replacing official anime portraits, such as with Toji Fushiguro or Zeke Yeager).

**What it does:**
This script entirely bypasses the generic character endpoint. It queries the *animated cast list endpoint* (`/anime/{id}/characters`), correlates the characters strictly by name, extracts their `mal_id` and `image_url` from the animated season explicitly, and safely injects them back into the local `.json` payload without overwriting the hand-crafted lore bio fields.

**Usage:**
```bash
python scripts/patch_jikan_images.py --file src/data/new_anime.json
```
