/**
 * Script to identify files that need to be adapted from PikDrive to Event Portal
 * This will help us organize our transformation process
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const rootDir = path.resolve(__dirname, '..');
const outputFile = path.join(rootDir, 'ADAPTATION_PLAN.md');

// File patterns to search for
const patterns = {
  rides: ['rides', 'ride'],
  bookings: ['bookings', 'booking'],
  drivers: ['drivers', 'driver'],
  pikdrive: ['pikdrive', 'pik'],
};

// Directories to exclude
const excludeDirs = [
  'node_modules',
  '.git',
  '.next',
  'scripts',
];

// File extensions to include
const includeExtensions = [
  '.tsx',
  '.ts',
  '.js',
  '.jsx',
  '.md',
  '.css',
];

// Function to check if a file should be processed
function shouldProcessFile(filePath) {
  const relativePath = path.relative(rootDir, filePath);
  
  // Check if file is in excluded directory
  if (excludeDirs.some(dir => relativePath.startsWith(dir))) {
    return false;
  }
  
  // Check file extension
  const ext = path.extname(filePath).toLowerCase();
  return includeExtensions.includes(ext);
}

// Function to search for patterns in a file
function searchPatternsInFile(filePath, patterns) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = {};
    
    for (const [key, terms] of Object.entries(patterns)) {
      const matches = terms.some(term => {
        const regex = new RegExp(`\\b${term}\\b`, 'i');
        return regex.test(content);
      });
      
      if (matches) {
        results[key] = true;
      }
    }
    
    return Object.keys(results).length > 0 ? results : null;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
}

// Function to walk directory and find files
function findFilesWithPatterns(dir, patterns) {
  const results = [];
  
  function walk(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        const relativePath = path.relative(rootDir, filePath);
        if (!excludeDirs.some(dir => relativePath.startsWith(dir))) {
          walk(filePath);
        }
      } else if (shouldProcessFile(filePath)) {
        const matchedPatterns = searchPatternsInFile(filePath, patterns);
        if (matchedPatterns) {
          results.push({
            path: path.relative(rootDir, filePath),
            patterns: matchedPatterns,
          });
        }
      }
    }
  }
  
  walk(dir);
  return results;
}

// Main function
function main() {
  console.log('Scanning files for adaptation patterns...');
  const files = findFilesWithPatterns(rootDir, patterns);
  
  // Group files by directory
  const filesByDir = {};
  for (const file of files) {
    const dir = path.dirname(file.path);
    if (!filesByDir[dir]) {
      filesByDir[dir] = [];
    }
    filesByDir[dir].push(file);
  }
  
  // Generate markdown report
  let markdown = `# Event Portal Adaptation Plan\n\n`;
  markdown += `This document lists files that need to be adapted from PikDrive to Event Portal.\n\n`;
  markdown += `## Files to Adapt\n\n`;
  
  for (const [dir, dirFiles] of Object.entries(filesByDir)) {
    markdown += `### ${dir}/\n\n`;
    
    for (const file of dirFiles) {
      const fileName = path.basename(file.path);
      const patternList = Object.keys(file.patterns).join(', ');
      
      markdown += `- [ ] \`${fileName}\` - Contains: ${patternList}\n`;
    }
    
    markdown += '\n';
  }
  
  markdown += `## Adaptation Strategy\n\n`;
  markdown += `1. **Rename Files**: Update file names to reflect event terminology\n`;
  markdown += `   - \`rides/\` → \`events/\`\n`;
  markdown += `   - \`bookings/\` → \`registrations/\`\n\n`;
  markdown += `2. **Update Content**: Replace terminology throughout the codebase\n`;
  markdown += `   - "ride" → "event"\n`;
  markdown += `   - "booking" → "registration"\n`;
  markdown += `   - "driver" → "organizer"\n`;
  markdown += `   - "passenger" → "attendee"\n\n`;
  markdown += `3. **Update Database References**: Use the new table names\n`;
  markdown += `   - "rides" → "events"\n`;
  markdown += `   - "bookings" → "event_registrations"\n\n`;
  
  // Write to file
  fs.writeFileSync(outputFile, markdown);
  console.log(`Report generated at ${outputFile}`);
}

main();
