export const RenounceOwnershipResponse = (tokenAddress:string,blockscan:string,transactionHash:string) => {
    let message = "`" + tokenAddress + "`\n\n";
    message += `Renounced: ${blockscan}tx/${transactionHash}\n`
    return message;
}
