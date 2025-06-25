#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Setting up Image Processing and Slider System...\n");

// Check if Node.js is installed
try {
	const nodeVersion = execSync("node --version", { encoding: "utf8" });
	console.log(`✅ Node.js version: ${nodeVersion.trim()}`);
} catch (error) {
	console.error("❌ Node.js is not installed. Please install Node.js first.");
	process.exit(1);
}

// Install backend dependencies
console.log("\n📦 Installing backend dependencies...");
try {
	execSync("npm install", { cwd: "./backend", stdio: "inherit" });
	console.log("✅ Backend dependencies installed successfully");
} catch (error) {
	console.error("❌ Failed to install backend dependencies");
	process.exit(1);
}

// Install frontend dependencies
console.log("\n📦 Installing frontend dependencies...");
try {
	execSync("npm install", { cwd: "./frontend", stdio: "inherit" });
	console.log("✅ Frontend dependencies installed successfully");
} catch (error) {
	console.error("❌ Failed to install frontend dependencies");
	process.exit(1);
}

// Check for .env file
const envPath = path.join(__dirname, ".env");
if (!fs.existsSync(envPath)) {
	console.log("\n📝 Creating .env file...");
	const envContent = `API_KEY=your_gemini_api_key_here
PORT=3001
`;
	fs.writeFileSync(envPath, envContent);
	console.log("✅ .env file created");
	console.log("⚠️  Please update the API_KEY in .env file with your Gemini API key");
} else {
	console.log("✅ .env file already exists");
}

// Create processed-images directory
const processedImagesDir = path.join(__dirname, "backend", "processed-images");
if (!fs.existsSync(processedImagesDir)) {
	fs.mkdirSync(processedImagesDir, { recursive: true });
	console.log("✅ Created processed-images directory");
}

console.log("\n🎉 Setup completed successfully!");
console.log("\n📋 Next steps:");
console.log("1. Update the API_KEY in .env file with your Gemini API key");
console.log("2. Start the backend server: cd backend && node server-enhanced.js");
console.log("3. Start the frontend: cd frontend && npm run dev");
console.log("4. Open http://localhost:5173 in your browser");
console.log("\n📚 For more information, see README.md");
