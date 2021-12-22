odoo.define('voip_fix.user_agent', function (require) {
    "use strict";
   var Class = require('web.Class');
    var voipUseragent = require('voip.UserAgent')
const core = require('web.core');
const CALL_STATE = {
    NO_CALL: 0,
    RINGING_CALL: 1,
    ONGOING_CALL: 2,
    CANCELING_CALL: 3,
    REJECTING_CALL: 4,
};
    const _t = core._t;

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
         },
        async _onInvite(inviteSession) {
        if (this._callState === CALL_STATE.ONGOING_CALL){
            // another session is active, therefore decline
            inviteSession.reject({ statusCode: 603 });
            return;
        } else if (this._ignoreIncoming) {
            /**
             * 488: "Not Acceptable Here"
             * Request doesn't succeed but may succeed elsewhere.
             *
             * If the VOIP account is also associated to other tools, like a desk phone,
             * the invitation is refused on web browser but might be accepted on the desk phone.
             *
             * If the call is ignored on the desk phone, will receive status code 486: "Busy Here",
             * meaning the endpoint is unavailable.
             *
             * If the call is not accepted at all, no invite session will launch.
            */
            inviteSession.reject({ statusCode: 488 });
            return;
        }

        function sanitizedPhone(prefix, number) {
            if (number.startsWith("00")){
                return "+" + number.substr(2, number.length);
            }
            else if (number.startsWith("0")) {
                return "+" + prefix + number.substr(1, number.length);
            }
            /* USA exception for domestic numbers : In the US, the convention is 1 (area code)
             * extension, while in Europe it is (0 area code)/extension.
             */
            else if (number.startsWith("1")) {
                return "+" + number;
            }
        }

        let name = inviteSession.remoteIdentity.displayName;
        const number = inviteSession.remoteIdentity.uri.user;
       // debugger;
         const incomingCallParams = { number };
             this._currentInviteSession = inviteSession;

            let numberSanitized = sanitizedPhone(inviteSession.remoteIdentity.uri.type, number);

            let domain;

            if (numberSanitized) {
                domain = [
                    '|', '|',
                    ['sanitized_phone', 'ilike', number],
                    ['sanitized_mobile', 'ilike', number],
                    '|',
                    ['sanitized_phone', 'ilike', numberSanitized],
                    ['sanitized_mobile', 'ilike', numberSanitized],
                ];
            } else {
                domain = [
                    '|',
                    ['sanitized_phone', 'ilike', number],
                    ['sanitized_mobile', 'ilike', number],
                ];
            }
            let contacts = await this._rpc({
                model: 'res.partner',
                method: 'search_read',
                domain: [['user_ids', '!=', false]].concat(domain),
                fields: ['id', 'display_name'],
                limit: 1,
            });
            if (!contacts.length) {
                contacts = await this._rpc({
                    model: 'res.partner',
                    method: 'search_read',
                    domain: domain,
                    fields: ['id', 'display_name'],
                    limit: 1,
                });
            }
            /* Fallback if inviteSession.remoteIdentity.uri.type didn't give the correct country prefix
            */
            // if (!contacts.length) {
            //     let lastSixDigitsNumber = number.substr(number.length - 6)
            //     contacts = await this._rpc({
            //         model: 'res.partner',
            //         method: 'search_read',
            //         domain: [
            //             '|',
            //             ['sanitized_phone', '=like', '%'+lastSixDigitsNumber],
            //             ['sanitized_mobile', '=like', '%'+lastSixDigitsNumber],
            //         ],
            //         fields: ['id', 'display_name'],
            //         limit: 1,
            //     });
            // }

            let contact = false;
            if (contacts.length) {
                contact = contacts[0];
                name = contact.display_name;
                incomingCallParams.partnerId = contact.id;
            }

        let content;
        if (name) {
            content = _.str.sprintf(_t("Incoming call from %s (%s)"), name, number);
        } else {
            content = _.str.sprintf(_t("Incoming call from %s"), number);
        }
        this._isOutgoing = false;
        this._updateCallState(CALL_STATE.RINGING_CALL);
        this._audioIncomingRingtone.currentTime = 0;
        if (this.PLAY_MEDIA) {
            this._audioIncomingRingtone.play().catch(() => {});
        }
        this._notification = this._sendNotification('Odoo', content);
        this._currentCallParams = incomingCallParams;
        this.trigger_up('incomingCall', incomingCallParams);

        this._currentInviteSession.on('rejected', () =>
            this._onCurrentInviteSessionRejected(inviteSession));
        if (!window.Notifcation || !window.Notification.requestPermission) {
           this._onWindowNotificationPermissionRequested({ content, inviteSession });
           return;
        }
        const res = window.Notification.requestPermission();
        if (!res) {
           this._onWindowNotificationPermissionRequested({ content, inviteSession });
           return;
        }
        res
            .then(permission => this._onWindowNotificationPermissionRequested({ content, inviteSession, permission }))
            .catch(() => this._onWindowNotificationPermissionRequested({ content, inviteSession }));
    },

    })
    //return UserAgentFix;
})

