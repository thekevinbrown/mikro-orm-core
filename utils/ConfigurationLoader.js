"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationLoader = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = __importDefault(require("path"));
const Configuration_1 = require("./Configuration");
const Utils_1 = require("./Utils");
class ConfigurationLoader {
    static async getConfiguration(validate = true, options = {}) {
        const paths = await ConfigurationLoader.getConfigPaths();
        for (let path of paths) {
            path = Utils_1.Utils.absolutePath(path);
            path = Utils_1.Utils.normalizePath(path);
            if (await fs_extra_1.pathExists(path)) {
                const config = Utils_1.Utils.requireFrom(path, process.cwd());
                return new Configuration_1.Configuration(Object.assign(Object.assign({}, (config.default || config)), options), validate);
            }
        }
        throw new Error(`MikroORM config file not found in ['${paths.join(`', '`)}']`);
    }
    static async getPackageConfig() {
        if (await fs_extra_1.pathExists(process.cwd() + '/package.json')) {
            return require(process.cwd() + '/package.json');
        }
        return {};
    }
    static async getSettings() {
        const config = await ConfigurationLoader.getPackageConfig();
        return config['mikro-orm'] || {};
    }
    static async getConfigPaths() {
        const paths = [];
        const settings = await ConfigurationLoader.getSettings();
        if (process.env.MIKRO_ORM_CLI) {
            paths.push(process.env.MIKRO_ORM_CLI);
        }
        paths.push(...(settings.configPaths || []));
        if (settings.useTsNode) {
            paths.push('./mikro-orm.config.ts');
        }
        paths.push('./mikro-orm.config.js');
        return paths;
    }
    static async registerTsNode(configPath = 'tsconfig.json') {
        var _a;
        const tsConfigPath = path_1.default.join(process.cwd(), configPath);
        Utils_1.Utils.requireFrom('ts-node', tsConfigPath).register({
            project: tsConfigPath,
            transpileOnly: true,
        });
        if (await fs_extra_1.pathExists(tsConfigPath)) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const tsConfig = require(tsConfigPath);
            /* istanbul ignore next */
            const paths = (_a = tsConfig.compilerOptions) === null || _a === void 0 ? void 0 : _a.paths;
            if (paths) {
                Utils_1.Utils.requireFrom('tsconfig-paths', tsConfigPath).register({
                    baseUrl: tsConfig.compilerOptions.baseUrl,
                    paths: tsConfig.compilerOptions.paths,
                });
            }
        }
    }
}
exports.ConfigurationLoader = ConfigurationLoader;
