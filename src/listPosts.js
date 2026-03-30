const { readFileSync, writeFileSync } = require('fs');

const xml = readFileSync('rss.xml', 'utf-8');

const decodeXml = (value) => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'");

const getTagContent = (input, tag) => {
  const match = input.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeXml(match[1].trim()) : '';
};

const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((match) => match[1]);

const posts = items.slice(1, 6).map((item) => {
  const title = getTagContent(item, 'title');
  const link = getTagContent(item, 'link');
  const pubDate = getTagContent(item, 'pubDate');
  const parsedDate = pubDate ? new Date(pubDate) : null;
  const date = parsedDate && !Number.isNaN(parsedDate.getTime())
    ? parsedDate.toISOString().split('T')[0]
    : '';

  return `-   ${date} [${title}](${link}?utm_source=GitHubProfile)`;
});


let readme = readFileSync('README.md', 'utf-8');
readme = readme.replace(/(?<=<!--START_SECTION:blog-posts-->\n)[\s\S]*(?=\n<!--END_SECTION:blog-posts-->)/, posts.join('\n'));
writeFileSync('README.md', readme);
