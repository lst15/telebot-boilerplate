export const RemoveLimitsResponse = (tokenAddress:string,blockscan:string,transactionHash:string) => {
    let message = "`" + tokenAddress + "`\n\n";
    message += `Removed: ${blockscan}tx/${transactionHash}\n`
    return message;
}
