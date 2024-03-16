export class CreateRequestModel {
    name!: string;
    symbol!: string;
    supply!: number;
    eth!: number;
}


const requiredKeys = ["name", "symbol", "supply", "eth"];

export function CreateDto(args: any) {
    const regex = /-(\w+)\s+([\w.]+)/g;

    const matches = [...args.matchAll(regex)];
    const keyValuePairs: any = {};

    for (const match of matches) {
        const key = match[1];
        keyValuePairs[key] = match[2];
    }

    for (var indexKey in requiredKeys) {
        const key = requiredKeys[indexKey];
        if (!(key in keyValuePairs)) {
            throw new Error("invalid key");
        }
    }

    return keyValuePairs as CreateRequestModel;
}
