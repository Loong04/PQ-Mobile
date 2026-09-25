const fs = require('fs');
const path = require('path');

function removeViewChartButton(filename) {
  const filePath = path.join(__dirname, '../modules/attendance/options/', filename);
  let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

  // Regex to remove view-chart-btn button from summary cards
  const btnRegex = /\s*<!-- AGENTS\.md View Chart Button Presentation Standard -->\s*<button type="button" class="view-chart-btn"[\s\S]*?<\/button>/g;
  
  if (btnRegex.test(content)) {
    content = content.replace(btnRegex, '');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully removed View Chart button from ${filename}`);
  } else {
    // Try simpler match without comment
    const simpleRegex = /\s*<button type="button" class="view-chart-btn"[\s\S]*?<\/button>/g;
    content = content.replace(simpleRegex, '');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Removed View Chart button (simple match) from ${filename}`);
  }
}

removeViewChartButton('shift-plan.html');
removeViewChartButton('ot-plan.html');
