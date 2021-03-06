import { IDatabaseDriver } from '../drivers';
import { Configuration } from './Configuration';
import { Dictionary } from '../typings';
export declare class ConfigurationLoader {
    static getConfiguration<D extends IDatabaseDriver = IDatabaseDriver>(validate?: boolean, options?: Partial<Configuration>): Promise<Configuration<D>>;
    static getPackageConfig(): Promise<Dictionary>;
    static getSettings(): Promise<Settings>;
    static getConfigPaths(): Promise<string[]>;
    static registerTsNode(configPath?: string): Promise<void>;
}
export interface Settings {
    useTsNode?: boolean;
    tsConfigPath?: string;
    configPaths?: string[];
}
