#!/usr/bin/env python3
"""
generate-static-seo.py

Generates pre-rendered static HTML shells for all universe pages.
Each output file lives at: public/universe/{slug}/index.html

The HTML includes:
- Canonical URL + meta description
- Open Graph tags (og:title, og:description, og:url, og:type, og:image)
- Twitter Card tags
- JSON-LD: Article schema, BreadcrumbList, FAQPage

Run at build time (or manually) from the repo root:
    python3 scripts/generate-static-seo.py
"""

import json, glob, os

# ── Config ──────────────────────────────────────────────────────────────────
REPO_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(REPO_DIR, 'src', 'data')
OUT_DIR = os.path.join(REPO_DIR, 'public', 'universe')
BASE_URL = 'https://animearchive.app'

os.makedirs(OUT_DIR, exist_ok=True)

# ── Universe loader ────────────────────────────────────────────────────────────
def load_universes():
    seen = set()
    universes = []
    for pattern in ['*.core.json', '*.json']:
        for path in glob.glob(os.path.join(SRC_DIR, pattern)):
            slug = os.path.basename(path).replace('.core.json', '').replace('.json', '')
            if slug in seen:
                continue
            seen.add(slug)
            with open(path) as f:
                universes.append((slug, json.load(f)))
    return sorted(universes, key=lambda x: x[0])

# ── HTML components ───────────────────────────────────────────────────────────
def build_og_tags(slug, anime, tagline, mal_id):
    url = f'{BASE_URL}/universe/{slug}'
    image = f'{BASE_URL}/api/og?id={slug}'
    title = f'{anime} System Analysis | Anime Architecture Archive'
    description = f'Explore the system architecture of {anime}.'
    twitter_title = f'{anime} System Analysis'
    return '\n  '.join([
        f'<meta property="og:title" content="{esc_attr(title)}">',
        f'<meta property="og:description" content="{esc_attr(description)}">',
        f'<meta property="og:url" content="{url}">',
        f'<meta property="og:type" content="article">',
        f'<meta property="og:image" content="{image}">',
        f'<meta property="article:author" content="Anime Architecture Archive">',
        f'<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{esc_attr(twitter_title)}">',
        f'<meta name="twitter:description" content="{esc_attr(description)}">',
        f'<meta name="twitter:image" content="{image}">',
    ])

def esc_attr(s):
    return str(s).replace('&','&amp;').replace('"','&quot;').replace('<','&lt;').replace('>','&gt;')

def build_jsonld_article(slug, anime, tagline, mal_id):
    url = f'{BASE_URL}/universe/{slug}'
    image = f'{BASE_URL}/api/og?id={slug}'
    title = f'{anime} System Analysis | Anime Architecture Archive'
    description = f'Explore the system architecture of {anime}.'
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': title,
        'description': description,
        'url': url,
        'image': image,
        'author': {'@type': 'Organization', 'name': 'Anime Architecture Archive'},
        'publisher': {'@type': 'Organization', 'name': 'Anime Architecture Archive', 'url': BASE_URL}
    }

def build_jsonld_breadcrumb(slug, anime):
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': BASE_URL},
            {'@type': 'ListItem', 'position': 2, 'name': anime, 'item': f'{BASE_URL}/universe/{slug}'}
        ]
    }

def build_jsonld_faq(slug, anime, tagline, data):
    # systemQuestions → FAQPage mainEntity
    sq = data.get('systemQuestions', [])
    if not sq:
        # Fallback: generic questions
        main_entity = [
            {
                '@type': 'Question',
                'name': f'What is the {anime} power system?',
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': f'{tagline}. This analysis covers 0 characters and 0 power systems.'
                }
            },
            {
                '@type': 'Question',
                'name': f'How does the {anime} social hierarchy work?',
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': f'The {anime} universe features a system analysis that shapes character relationships and narrative progression.'
                }
            }
        ]
    else:
        main_entity = []
        for q in sq:
            name = q.get('question', '')
            answer = q.get('answer', '')
            if name and answer:
                main_entity.append({
                    '@type': 'Question',
                    'name': name,
                    'acceptedAnswer': {'@type': 'Answer', 'text': answer}
                })
        if not main_entity:
            main_entity = [
                {
                    '@type': 'Question',
                    'name': f'What is the {anime} power system?',
                    'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': f'{tagline}. This analysis covers 0 characters and 0 power systems.'
                    }
                }
            ]

    return {'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': main_entity}

def build_html(slug, data):
    anime = data.get('anime', slug)
    tagline = data.get('tagline', f'Explore the system architecture of {anime}.')
    mal_id = data.get('malId', '')
    title = f'{anime} System Analysis | Anime Architecture Archive'
    url = f'{BASE_URL}/universe/{slug}'
    description = f'Explore the system architecture of {anime}.'
    keywords = f'anime, {anime.lower()}, system analysis, power systems, anime architecture'

    article_ld = build_jsonld_article(slug, anime, tagline, mal_id)
    breadcrumb_ld = build_jsonld_breadcrumb(slug, anime)
    faq_ld = build_jsonld_faq(slug, anime, tagline, data)
    jsonld = json.dumps([article_ld, breadcrumb_ld, faq_ld], indent=2, ensure_ascii=False)

    og_tags = build_og_tags(slug, anime, tagline, mal_id)

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{esc_attr(title)}</title>
  <meta name="description" content="{esc_attr(description)}">
  <link rel="canonical" href="{url}">
  {og_tags}
  <meta name="keywords" content="{esc_attr(keywords)}">
  <script type="application/ld+json">{jsonld}
  </script>
</head>
<body>
  <noscript>You need to enable JavaScript to run this app.</noscript>
  <div id="root"></div>
</body>
</html>
'''

# ── Main ───────────────────────────────────────────────────────────────────────
def main():
    universes = load_universes()
    print(f'Generating static SEO pages for {len(universes)} universes...')
    for slug, data in universes:
        html = build_html(slug, data)
        out_path = os.path.join(OUT_DIR, slug, 'index.html')
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f'  ✓ {slug}')
    print(f'Done. {len(universes)} pages generated in {OUT_DIR}/')

if __name__ == '__main__':
    main()
