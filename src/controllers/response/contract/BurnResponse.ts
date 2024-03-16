export const BurnResponse = (tokenAddress:string,blockscan:string,transactionHash:string) => {
    let message = "`" + tokenAddress + "`\n\n";
    message += `Burned: ${blockscan}tx/${transactionHash}\n`
    return message;
}
