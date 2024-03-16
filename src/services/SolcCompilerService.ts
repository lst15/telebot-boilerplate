import {SolcRepository} from "../repository/SolcRepository";
import {CodeCreator} from "../contracts/CodeCreator";

export class SolcCompilerService {
    private async compile(code: string,name:string) {
        const input: any = {
            language: "Solidity",
            sources: {
                //   contract_name: {
                //     content: code,
                //   },
            },
            settings: {
                outputSelection: {
                    "*": {
                        "*": ["*"],
                    },
                },
            },
        };

        while (SolcRepository.solCompiler === undefined) {
            await new Promise((r) => setTimeout(r, 1000));
        }

        input.sources[name] = { content: code };

        return SolcRepository.solCompiler.compile(JSON.stringify(input));
    }

    async bytecodeByContractCode(contract_code:string,contract_name:string){
        const compiled = JSON.parse(await this.compile(contract_code,contract_name + ".sol"));
        return compiled.contracts[contract_name + ".sol"][contract_name].evm.bytecode.object;
    }

}
