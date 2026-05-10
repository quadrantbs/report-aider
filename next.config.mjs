/** @type {import('next').NextConfig} */
const nextConfig = {
	turbopack: {
		// Ensure Turbopack root is explicit to avoid inferred-root warnings
		// '.' means this `report-aider` folder is the project root.
		root: './',
	},
};

export default nextConfig;
