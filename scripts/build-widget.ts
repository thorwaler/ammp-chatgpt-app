/**
 * Build Script for AMMP Widget
 * Bundles React app into a single HTML file for ChatGPT
 */

import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const buildWidget = async () => {
  console.log('🔨 Building AMMP Widget...\n');

  try {
    // Bundle the React app
    const result = await esbuild.build({
      entryPoints: ['src/web/index.tsx'],
      bundle: true,
      minify: true,
      target: 'es2020',
      format: 'iife',
      write: false,
      outdir: 'out', // Required for CSS handling
      jsx: 'automatic',
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts',
      },
      external: [
        'react',
        'react-dom',
        'recharts',
      ],
    });

    // Extract JS and CSS from output files
    const jsFile = result.outputFiles.find(f => f.path.endsWith('.js'));
    const cssFile = result.outputFiles.find(f => f.path.endsWith('.css'));
    
    const jsCode = jsFile?.text || '';
    const cssCode = cssFile?.text || readFileSync('src/web/App.css', 'utf-8');

    // Create HTML template
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AMMP Energy Monitor</title>
  
  <!-- React from CDN -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  
  <!-- Recharts from CDN -->
  <script src="https://unpkg.com/recharts@2.10.0/dist/Recharts.js"></script>
  
  <style>
${cssCode}
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script>
${jsCode}
  </script>
</body>
</html>`;

    // Write to public directory
    const outputPath = join(process.cwd(), 'public', 'widget.html');
    writeFileSync(outputPath, html);

    console.log('✅ Widget built successfully!');
    console.log(`📦 Output: ${outputPath}`);
    console.log(`📏 Size: ${(html.length / 1024).toFixed(2)} KB\n`);
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
};

buildWidget();
