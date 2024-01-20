import telebot from "telebot";
import { envUpdate } from "../utils/env-update";
import { env } from "../env-schema";
import { ConfigurationRepository } from "../repository/ConfigurationRepository";

const configurationRepository = new ConfigurationRepository()

export class ConfigurationService {

  loadConfigFile(file_configName:string){
    configurationRepository.loadFile(file_configName);
  }

  getConfig_byName(key:string){
    return configurationRepository.getConfig(key);
  }
}