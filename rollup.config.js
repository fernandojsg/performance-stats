import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'index.js',
  plugins: [resolve({
    customResolveOptions: 'node_modules'
  })],
	// sourceMap: true,
	output: [
		{
			format: 'umd',
			name: 'PERFSTATS',
			file: 'dist/performance-stats.js',
			indent: '\t'
		},
		{
			format: 'es',
			file: 'dist/performance-stats.module.js',
			indent: '\t'
    },
		{
			format: 'cjs',
			file: 'dist/performance-stats.cjs.js',
			indent: '\t'
		}    
	]
};