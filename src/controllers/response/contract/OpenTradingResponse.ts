export const OpenTradingResponse = (tokenAddress:string,blockscan:string,transactionHash:string) => {
    let message = "`" + tokenAddress + "`\n\n";
    message += `Open Trading: ${blockscan}tx/${transactionHash}\n`
    return message;
}
