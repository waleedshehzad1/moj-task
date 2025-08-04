// This script updates all the test cases to use authentication headers

const fs = require('fs');
const path = require('path');

const taskControllerTestPath = path.join(__dirname, 'src', 'tests', 'controllers', 'taskController.test.js');

// Read the file
let fileContent = fs.readFileSync(taskControllerTestPath, 'utf8');

// First pattern: const response = await request(app).get('/api/v1/tasks')
const pattern1 = /const response = await request\(app\)\s+\.([a-z]+)\('([^']+)'\)/g;
const replacement1 = "const response = await authRequest('$1', '$2')";

fileContent = fileContent.replace(pattern1, replacement1);

// Second pattern: const response = await request(app).get(`/api/v1/tasks/${testTask.id}`)
const pattern2 = /const response = await request\(app\)\s+\.([a-z]+)\(`([^`]+)`\)/g;
const replacement2 = "const response = await authRequest('$1', `$2`)";

fileContent = fileContent.replace(pattern2, replacement2);

// Write the changes back
fs.writeFileSync(taskControllerTestPath, fileContent, 'utf8');

console.log('Successfully updated all test requests to use authentication');
