#!/usr/bin/env node

/**
 * PlaceIQ - Deployment Verification Script
 * Run this before deploying to Render to catch any issues
 */

const fs = require('fs');
const path = require('path');

const checks = [];
let passCount = 0;
let failCount = 0;

function check(name, condition, details = '') {
  const status = condition ? '✅' : '❌';
  const result = condition ? 'PASS' : 'FAIL';
  console.log(`${status} ${name} [${result}]`);
  if (details) console.log(`   └─ ${details}`);
  
  if (condition) passCount++;
  else failCount++;
  
  checks.push({ name, condition, details });
}

console.log('\n🔍 PlaceIQ Deployment Verification\n');

// 1. File structure checks
console.log('📁 File Structure:');
check(
  'server/server.js exists',
  fs.existsSync(path.join(__dirname, 'server', 'server.js'))
);
check(
  'server/package.json exists',
  fs.existsSync(path.join(__dirname, 'server', 'package.json'))
);
check(
  'client/package.json exists',
  fs.existsSync(path.join(__dirname, 'client', 'package.json'))
);
check(
  'Root package.json exists',
  fs.existsSync(path.join(__dirname, 'package.json'))
);

// 2. Build files
console.log('\n🏗️  Build Configuration:');
check(
  'render.yaml exists',
  fs.existsSync(path.join(__dirname, 'render.yaml'))
);
check(
  'Procfile exists',
  fs.existsSync(path.join(__dirname, 'Procfile'))
);

// 3. Environment configuration
console.log('\n🔐 Environment Configuration:');
check(
  'server/.env exists',
  fs.existsSync(path.join(__dirname, 'server', '.env')),
  'Development environment file'
);
check(
  'server/.env.production exists',
  fs.existsSync(path.join(__dirname, 'server', '.env.production')),
  'Production environment file'
);

// 4. Package.json validation
console.log('\n📦 Dependencies:');
try {
  const rootPkg = require(path.join(__dirname, 'package.json'));
  check(
    'Root package.json has render-build script',
    rootPkg.scripts && rootPkg.scripts['render-build'],
    rootPkg.scripts?.['render-build'] || 'Not found'
  );
  check(
    'Root package.json has start script',
    rootPkg.scripts && rootPkg.scripts.start,
    rootPkg.scripts?.start || 'Not found'
  );
  check(
    'Root package.json has build script',
    rootPkg.scripts && rootPkg.scripts.build,
    rootPkg.scripts?.build || 'Not found'
  );
} catch (e) {
  check('Root package.json is valid JSON', false, e.message);
}

try {
  const serverPkg = require(path.join(__dirname, 'server', 'package.json'));
  check(
    'Server has express dependency',
    serverPkg.dependencies && serverPkg.dependencies.express,
    serverPkg.dependencies?.express || 'Not found'
  );
  check(
    'Server has mongoose dependency',
    serverPkg.dependencies && serverPkg.dependencies.mongoose,
    serverPkg.dependencies?.mongoose || 'Not found'
  );
  check(
    'Server has dotenv dependency',
    serverPkg.dependencies && serverPkg.dependencies.dotenv,
    serverPkg.dependencies?.dotenv || 'Not found'
  );
} catch (e) {
  check('Server package.json is valid JSON', false, e.message);
}

// 5. Code configuration checks
console.log('\n⚙️  Code Configuration:');
try {
  const serverJs = fs.readFileSync(path.join(__dirname, 'server', 'server.js'), 'utf8');
  check(
    'Server serves static React files',
    serverJs.includes('express.static'),
    'SPA support configured'
  );
  check(
    'Server handles CORS',
    serverJs.includes('cors'),
    'CORS middleware enabled'
  );
  check(
    'Server has API routes',
    serverJs.includes('/api/'),
    'API routes defined'
  );
  check(
    'MongoDB connection configured',
    serverJs.includes('mongoose') && serverJs.includes('connect'),
    'Database connection setup'
  );
  check(
    'Server listens on 0.0.0.0',
    serverJs.includes("'0.0.0.0'"),
    'Containerization ready'
  );
} catch (e) {
  check('Server.js is readable', false, e.message);
}

// 6. Git configuration
console.log('\n🔄 Git Configuration:');
check(
  '.gitignore exists',
  fs.existsSync(path.join(__dirname, '.gitignore')),
  'Prevents committing node_modules and .env'
);

// Summary
console.log('\n' + '='.repeat(50));
console.log(`\n📊 Results: ${passCount} passed, ${failCount} failed\n`);

if (failCount === 0) {
  console.log('✨ All checks passed! Your app is ready for deployment.\n');
  console.log('📋 Next steps:');
  console.log('1. git add .');
  console.log('2. git commit -m "Deploy: Ready for Render"');
  console.log('3. git push origin main');
  console.log('4. Go to render.com and create a new Web Service');
  console.log('5. Connect your GitHub repository');
  console.log('6. Set environment variables');
  console.log('7. Click "Create Web Service"');
  console.log('');
} else {
  console.log('⚠️  Some checks failed. Fix the issues above before deploying.\n');
  process.exit(1);
}
