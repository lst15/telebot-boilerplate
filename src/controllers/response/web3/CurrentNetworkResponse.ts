import {Web3Repository} from "../../../repository/Web3Repository";

export const CurrentNetworkResponse = () => {
    let message = "`" + Web3Repository.networkName + "`\n\n"
    message += "Network Id: `" + Web3Repository.networkId + "`\n"
    message += "Factory: `" + Web3Repository.networkFactoryAddress + "`\n"
    message += "wEth: `" + Web3Repository.wethAddress + "`\n"
    message += "Router `" + Web3Repository.networkRouterAddress + "`\n"
    message += "Decimals: `" + Web3Repository.networkDecimals.toString() + "`\n"

    return message;
}
