interface MESSAGE {
    id: number;
    responses: ArrayMessage;
    author: string;
    data: string;
}
export declare function lastModified(): string;
export declare class ArrayMessage extends Array<MESSAGE> {
    private static _lastModified;
    get lastModified(): string;
    forceUpdate(): void;
    constructor(...L: MESSAGE[]);
    splice(start: number, deleteCount?: number): MESSAGE[];
    push(...L: MESSAGE[]): number;
}
export declare const rootMessage: MESSAGE;
export declare function createMessage(author: string, data: string, parentId?: number): MESSAGE | undefined;
export declare function deleteMessage(id: number): boolean;
export declare function updateMessage(id: number, data: string): MESSAGE | undefined;
export declare function getMessage(id: number, L?: MESSAGE[]): MESSAGE | undefined;
export declare function toHTML(login?: string): string;
export {};
//# sourceMappingURL=data.d.ts.map