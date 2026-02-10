const { getDefaultConfig } = require("expo/metro-config")
const path = require("path")

const projectRoot = __dirname

const config = getDefaultConfig(projectRoot)

// CRITICAL: Only look in this project's node_modules.
// Do NOT traverse up to root monorepo node_modules (which has React 18 from Medusa).
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, "node_modules"),
]

// Disable looking in parent directories
config.resolver.disableHierarchicalLookup = true

module.exports = config
