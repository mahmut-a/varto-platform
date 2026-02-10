const { getDefaultConfig } = require("expo/metro-config")
const path = require("path")

const projectRoot = __dirname
const monorepoRoot = path.resolve(projectRoot, "../..")

const config = getDefaultConfig(projectRoot)

// Force Metro to resolve React & React Native from this project's node_modules
// (not the root monorepo node_modules which has React 18 from Medusa backend)
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(monorepoRoot, "node_modules"),
]

// Ensure only one copy of these packages
config.resolver.extraNodeModules = {
    react: path.resolve(projectRoot, "node_modules/react"),
    "react-native": path.resolve(projectRoot, "node_modules/react-native"),
    "react-dom": path.resolve(projectRoot, "node_modules/react-dom"),
}

// Watch the entire monorepo
config.watchFolders = [monorepoRoot]

module.exports = config
