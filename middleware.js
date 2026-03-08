export const config = {
  matcher: '/universe/:id*',
};

export default async function middleware(req) {
  const url = new URL(req.url);
  const idPath = url.pathname.replace('/universe/', '');
  const id = idPath.split('/')[0] || 'aot';

  // Fetch the root HTML from the same host
  const reqUrl = new URL(req.url);
  reqUrl.pathname = '/';
  
  const response = await fetch(reqUrl);
  const html = await response.text();
  
  const baseUrl = `https://${url.host}`;
  const ogImageUrl = `${baseUrl}/api/og?id=${id}`;
  const title = `${id.toUpperCase()} - Anime Architecture Archive`;
  
  let newHtml = html
    .replace('<title>Anime Architecture Archive</title>', `<title>${title}</title>`)
    .replace('<meta property="og:title" content="Anime Architecture Archive" />', `<meta property="og:title" content="${title}" />`);
    
  // Add the dynamic images just before </head>
  newHtml = newHtml.replace('</head>', `
    <meta property="og:image" content="${ogImageUrl}" />
    <meta name="twitter:image" content="${ogImageUrl}" />
  </head>`);
  
  return new Response(newHtml, {
    headers: { 'content-type': 'text/html; charset=utf-8' }
  });
}
