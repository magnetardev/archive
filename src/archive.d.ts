interface Types {
  string: string;
  number: number;
  array: any[];
  boolean: boolean;
}

type TypeName = keyof Types;
type TypeNameMap<T> = T extends null
  ? null
  : T extends TypeName
  ? Types[T]
  : unknown;

export interface Module {
  HEAPU8: Uint8Array;

  onRuntimeInitialized: () => void;
  locateFile: (path: string, prefix: string) => string;
  _malloc(size: number): number;
  _free(ptr: number): void;

  cwrap<
    Arguments extends unknown[] = unknown[],
    RetString extends TypeName = TypeName,
    Returns extends TypeNameMap<RetString> = TypeNameMap<RetString>,
    ArgStrings extends TypeName[] = TypeName[]
  >(
    ident: string,
    returnType: RetString,
    argTypes: ArgStrings
  ): (...args: Arguments) => Returns;

  FS: {
    readFile(path: string);
    unlink(path: string);
  };
}

declare const ModuleFunction: (
  module?: Partial<Module>,
  ...args: unknown[]
) => Module;

export default ModuleFunction;
