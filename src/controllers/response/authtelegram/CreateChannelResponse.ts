export const CreateChannelResponse = (userChannel:string) => {
    let message = "Channel: `" + 't.me/'.concat(userChannel) + "`\n";
    message += "Join: `" + '@'.concat(userChannel) + "`\n\n"

    return message;
}
