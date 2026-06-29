import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data.json');
if (fs.existsSync(dataPath)) {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const last = data[data.length - 1];
  if (last.d === '29-06-26') {
    data.pop();
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    console.log('Removed simulated data for 29-06-26');
  }
}
