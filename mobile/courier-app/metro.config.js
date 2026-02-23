const { getDefaultConfig } = require("expo/metro-config")
const path = require("path")

const projectRoot = __dirname
const localNodeModules = path.resolve(projectRoot, "node_modules")

const config = getDefaultConfig(projectRoot)

// Only look in this project's node_modules first
config.resolver.nodeModulesPaths = [localNodeModules]

// Intercept React-related resolutions to force local copies
const originalResolveRequest = config.resolver.resolveRequest
config.resolver.resolveRequest = (context, moduleName, platform) => {
    // Force react, react-native, react-dom to resolve from local node_modules
    const forcedLocal = ["react", "react/jsx-runtime", "react/jsx-dev-runtime", "react-native", "react-dom"]
    for (const pkg of forcedLocal) {
        if (moduleName === pkg) {
            return context.resolveRequest(
                { ...context, resolveRequest: undefined },
                moduleName,
                platform,
            )
        }
    }

    if (originalResolveRequest) {
        return originalResolveRequest(context, moduleName, platform)
    }
    return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
