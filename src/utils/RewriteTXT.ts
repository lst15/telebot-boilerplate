//telegram_bot.start();
const fs = require("fs");

export function RewriteFile(content: string, path: string) {
    fs.writeFile(path, content, (err: any) => {
        if (err) throw err;
    });
}
