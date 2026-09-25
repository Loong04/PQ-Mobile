const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const filePath = path.join(__dirname, '../modules/claims/options/travel-request.html');
const html = fs.readFileSync(filePath, 'utf8');

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable",
  url: "file://" + filePath
});

const { window } = dom;
const { document } = window;

console.log("Checking Travel Request HTML initial setup...");

// Set active category to task and call openEntryForm
window.formData.activeCategory = 'task';
console.log("Current active view before openEntryForm:", window.formData.currentView);
console.log("view-4-entry active before:", document.getElementById('view-4-entry').classList.contains('active'));

// Call openEntryForm()
window.openEntryForm();

console.log("Current active view after openEntryForm:", window.formData.currentView);
console.log("view-4-entry active after:", document.getElementById('view-4-entry').classList.contains('active'));

const entryTaskName = document.getElementById('entryTaskName');
console.log("entryTaskName element exists:", !!entryTaskName, entryTaskName ? entryTaskName.value : '');

// Test saveSubItem
window.saveSubItem();
console.log("Items count after saveSubItem:", window.formData.requestDetails.taskItems.length);
console.log("Current active view after saveSubItem:", window.formData.currentView);
console.log("view-3-list active after saveSubItem:", document.getElementById('view-3-list').classList.contains('active'));

if (window.formData.requestDetails.taskItems.length === 1 && document.getElementById('view-3-list').classList.contains('active')) {
  console.log("SUCCESS: Add Item flow in travel-request.html is working correctly!");
} else {
  console.error("FAILURE: Add Item flow in travel-request.html failed!");
  process.exit(1);
}
