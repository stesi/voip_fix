
import { patch } from "@web/core/utils/patch";
import { UserAgent } from "@voip/core/user_agent_service";

patch(UserAgent.prototype, {
   get sipJsUserAgentConfig() {
    var options = super.sipJsUserAgentConfig;

    if (this.voip.webSocketUrl && this.voip.webSocketUrl.includes("wss://")) {
        if (!options.contactParams) {
            options.contactParams = {};
        }
          options.contactParams.transport = "wss";
    }
    return options
}
});
