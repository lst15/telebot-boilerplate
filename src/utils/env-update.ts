import * as envfile from "envfile";
import { readFile, writeFileSync } from "fs";
import { resolve } from "path";

export const envUpdate = (
    envVariables: { key: string; value: any }[]
): void => {
    // get `.env` from path of current directory
    const path = resolve(__dirname, "../../.env");
    readFile(path, "utf8", (err: any, data: any) => {
        if (err) {
            console.error(err);
            return;
        }

        const parsedFile = envfile.parse(data);
        envVariables.forEach((envVar: { key: string; value: any }) => {
            if (envVar.key && envVar.value) {
                parsedFile[envVar.key] = envVar.value;
            }
        });
        writeFileSync(path, envfile.stringify(parsedFile));

        // NB: You should now be able to see your .env with the new values,
        // also note that any comments or newlines will be stripped from
        // your .env after the writeFileSync, but all your pre-existing
        // vars should still appear the .env.
    });
};