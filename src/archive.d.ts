// <reference types="vite/client" />

import type { ModuleInstance } from "./loader";

declare const mod: (config: Partial<ModuleInstance>) => Promise<ModuleInstance> | ModuleInstance;
export default mod;
