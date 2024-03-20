export const ListWalletsResponse = (wallets:string[]) => {
    return wallets.length > 0 ? wallets.join("\n") : "haven't wallets"
}
