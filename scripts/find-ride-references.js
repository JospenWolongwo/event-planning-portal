/**
 * Script to identify remaining ride-sharing references in the codebase
 * Run with: node scripts/find-ride-references.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Terms to search for
const searchTerms = [
  'ride',
  'driver',
  'passenger',
  'booking',
  'pikdrive',
  'trip',
  'journey'
];

// Directories to exclude
const excludeDirs = [
  'node_modules',
  '.next',
  '.git',
  'scripts'
];

// File extensions to include
const includeExtensions = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.sql',
  '.md',
  '.json'
];

// Function to search for terms in a file
function searchInFile(filePath, terms) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = [];
    
    terms.forEach(term => {
      // Case insensitive search
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      if (regex.test(content)) {
        matches.push(term);
      }
    });
    
    if (matches.length > 0) {
      return {
        file: filePath,
        matches: [...new Set(matches)] // Remove duplicates
      };
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
  }
  
  return null;
}

// Function to walk through directories
function walkDir(dir, terms, callback) {
  const results = [];
  
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    // Skip excluded directories
    if (stat.isDirectory() && !excludeDirs.includes(file)) {
      results.push(...walkDir(filePath, terms, callback));
    } else if (stat.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      if (includeExtensions.includes(ext)) {
        const result = callback(filePath, terms);
        if (result) {
          results.push(result);
        }
      }
    }
  });
  
  return results;
}

// Main function
function findRideReferences() {
  console.log('Searching for ride-sharing references in the codebase...');
  
  const projectRoot = path.resolve(__dirname, '..');
  const results = walkDir(projectRoot, searchTerms, searchInFile);
  
  console.log(`\nFound ${results.length} files with ride-sharing references:`);
  
  results.forEach(result => {
    console.log(`\n${result.file}`);
    console.log(`  Terms found: ${result.matches.join(', ')}`);
  });
  
  console.log('\nRecommended actions:');
  console.log('1. Review each file and update terminology to event-related terms');
  console.log('2. For SQL files, consider creating new migration files with proper event terminology');
  console.log('3. Update directory names that still reference ride-sharing concepts');
  
  return results;
}

// Run the search
const results = findRideReferences();

// Write results to a file for reference
fs.writeFileSync(
  path.resolve(__dirname, 'ride-references-report.json'),
  JSON.stringify(results, null, 2)
);

console.log('\nDetailed report saved to scripts/ride-references-report.json');
