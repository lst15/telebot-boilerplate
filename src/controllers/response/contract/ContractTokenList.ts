export const ContractTokenListResponse = (contractTokenList:string[]) => {
    return contractTokenList.length > 0 ? contractTokenList.join("\n") : "haven't any contract address"
}
