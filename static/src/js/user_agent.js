odoo.define('voip_fix.user_agent', function (require) {
    "use strict";
   var Class = require('web.Class');
    var voipUseragent = require('voip.UserAgent')

//debugger;
   voipUseragent.include(  {
        init(parent){
            console.log("init")

            //mixins.EventDispatcherMixin.init.call(this);
          //  voipUseragent.init.call(this)
            this._super.apply(this, arguments);
        },
         _getUaConfig(params) {
            var ua_opt = this._super.apply(this, arguments);
            if (typeof ua_opt.sessionDescriptionHandlerFactoryOptions['peerConnectionOptions'] =="undefined"){
                ua_opt.sessionDescriptionHandlerFactoryOptions['peerConnectionOptions'] = {}
            }
            if (typeof ua_opt.sessionDescriptionHandlerFactoryOptions['peerConnectionOptions']['rtcConfiguration'] =="undefined"){
                ua_opt.sessionDescriptionHandlerFactoryOptions['peerConnectionOptions']['rtcConfiguration'] = {}
            }

              ua_opt.sessionDescriptionHandlerFactoryOptions['peerConnectionOptions']['rtcConfiguration']['iceServers']=[{
                          urls: "stun:stun.l.google.com:19302"
                      }]
           ua_opt.sessionDescriptionHandlerFactoryOptions['peerConnectionOptions']['rtcConfiguration']['rtcpMuxPolicy']='negotiate'
             ua_opt.sessionDescriptionHandlerFactoryOptions['peerConnectionOptions']['iceCheckingTimeout']=500
            return ua_opt;
         }

    })
    //return UserAgentFix;
})

