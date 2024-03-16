import telebot from "telebot";
import { envUpdate } from "../utils/env-update";
import { env } from "../env-schema";
import { ConfigurationRepository } from "../repository/ConfigurationRepository";
import {Provider} from "nconf";

const configurationRepository = new ConfigurationRepository()

export class ConfigurationService {}
