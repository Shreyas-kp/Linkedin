const fs = require('fs');
const path = require('path');

const examplesPath = path.join(__dirname, '..', 'data', 'examples.json');
const outPath = path.join(__dirname, '..', 'data', 'examples_with_embeddings.json');

function simpleEmbed(text) {
  const tokens = (text || '').toLowerCase().match(/\b\w{3,}\b/g) || [];
  const freq = {};
  for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
  const keys = Object.keys(freq).sort().slice(0, 64);
  const vec = keys.map(k => freq[k] || 0);
  return vec;
}

function main(){
  if (!fs.existsSync(examplesPath)){
    console.error('examples.json not found at', examplesPath);
    process.exit(1);
  }
  const raw = fs.readFileSync(examplesPath,'utf8');
  const examples = JSON.parse(raw);
  const out = examples.map(e => ({...e, embedding: simpleEmbed(e.text)}));
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
  console.log('Wrote', outPath);
}

main();
