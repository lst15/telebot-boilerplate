import {Web3Repository} from "../../../repository/Web3Repository";

export const ApplyRpcResponse = () => {
    return  "now you are using ".concat(Web3Repository.networkName).concat(" chain")
}
