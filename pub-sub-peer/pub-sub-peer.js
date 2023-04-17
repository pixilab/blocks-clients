(()=>{var e={d:(t,r)=>{for(var s in r)e.o(r,s)&&!e.o(t,s)&&Object.defineProperty(t,s,{enumerable:!0,get:r[s]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r:e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},t={};(()=>{"use strict";e.r(t),e.d(t,{ArrayPar:()=>p,BoolPar:()=>a,DictPar:()=>f,NumPar:()=>l,PubSubPeer:()=>s,ReplyPar:()=>b,Str1Par:()=>c,Str2Par:()=>u,SyncPar:()=>d,TickPar:()=>h});var r=function(){this.handlers=new Set},s=function(){function e(e,t,r,s){void 0===s&&(s=!0),this.subscribers={},this.toSubUnsub={},this.toSet={},this.toAdd={},this.stateChangeNotifier=e,this.msgHandler=r,this.lastQueryId=0,s&&this.connect(t),this.autoConnect=s}return e.prototype.connect=function(e){if(this.autoConnect)console.error("Don't call connect if set to auto-connect");else{if(e||!this.wsUrl){var t,r,s;e&&(s=/^(http:|https:|ws:|wss:)\/\/(.+?)(\/.*)/.exec(e))?(t=s[1],r=s[2],e=s[3]):(t=location.protocol,r=location.host);var i="https:"===t||"wss:"===t?"wss://":"ws://";i+=r,e||(e="/rpc/pub-sub"),this.wsUrl=i+e}this.attemptToConnectSoon(5)}},e.prototype.close=function(){this.socket.close(3e3,"Forced reset")},e.prototype.subscribe=function(e,t,s){var i=this.subscribers[e];i||(this.subscribers[e]=i=new r),i.subscribed||(this.toSubUnsub[e]=!0,this.requestServerCall()),i.handlers.add(t);var n=i.lastValue;return s&&null!=n&&t.dataReceived(n,e),n},e.prototype.unsubscribe=function(e,t){var r=this.subscribers[e];r&&(r.handlers.delete(t)||console.warn("PubSubPeer no callback for",e),0===r.handlers.size&&(this.toSubUnsub[e]=!0,this.requestServerCall()))},e.prototype.subUnsub=function(e,t,r,s){if(e)return this.subscribe(t,r,s);this.unsubscribe(t,r)},e.prototype.set=function(e,t){this.toSet[e]=t,delete this.toAdd[e],this.impliedSubscribe(e),this.requestServerCall()},e.prototype.add=function(e,t){this.toAdd[e]=t,this.impliedSubscribe(e),this.requestServerCall()},e.prototype.impliedSubscribe=function(e){this.subscribers[e]||((this.subscribers[e]=new r).subscribed=!0)},e.prototype.tell=function(e,t){this.sendMsg(n("tell",e,t))},e.prototype.send=function(e,t){this.sendMsg(n("send",e,t))},e.channelName=function(t,r){return e.kStreamPrefix+t+"."+e.kChannelStreamInfix+r},e.prototype.resetStream=function(e){this.sendMsg(n("reset",e))},e.prototype.logWarning=function(e){this.sendMsg({name:"warning",param:e}),console.warn(JSON.stringify(e))},e.prototype.logError=function(e){this.sendMsg({name:"error",param:e}),console.error(JSON.stringify(e))},e.prototype.sendMsg=function(e){this.toTell||(this.toTell=[]),this.online||this.toTell.length<30?(this.toTell.push(e),this.requestServerCall()):console.error("Dropped WSMsg. No socket.")},e.prototype.ask=function(e){var t=this;return new Promise((function(r,s){if(t.online){e.id=++t.lastQueryId;var i=t.pendingQueries;i||(t.pendingQueries=i={}),i[e.id]={resolver:r,rejector:s},t.sendMsg(e)}else s("Offline")}))},e.prototype.attemptToConnectSoon=function(e){var t=this;this.pendingConnect||(this.pendingConnect=window.setTimeout((function(){t.pendingConnect=void 0,t.attemptConnect()}),e))},e.prototype.attemptConnect=function(){var e=this;this.discardSocket();var t=new WebSocket(this.wsUrl);this.socket=t,t.onopen=function(){e.toTell=[],e.reSubscribeAll(),e.setOnline(!0),e.tellServer()},t.onmessage=function(t){e.treatIncomingData(JSON.parse(t.data))},t.onerror=t.onclose=function(t){e.discardSocket(),e.autoConnect&&e.attemptToConnectSoon(2e3),e.setOnline(!1)}},e.prototype.discardSocket=function(){var e=this.socket;e&&(e.onopen=void 0,e.onmessage=void 0,e.onerror=void 0,this.setOnline(!1),e.close(),delete this.socket)},e.prototype.setOnline=function(e){if(this.online!==e){this.online=e;var t=this.pendingQueries;if(!e&&t){for(var r in t){var s=t[r];s.rejector&&s.rejector("Offline")}this.pendingQueries=void 0}}this.stateChangeNotifier&&this.stateChangeNotifier(e)},e.prototype.isOnline=function(){return this.online},e.prototype.treatIncomingData=function(e){for(var t=0,r=e;t<r.length;t++){var s=r[t];switch(s.name){case"change":this.handleNewData(s.param,!1);break;case"stream":this.handleNewData(s.param,!0);break;case"ping":this.sendMsg({name:"pong"});break;case"reply":if(s.isResponse&&s.id&&s.param){var i=s.param.data;this.handleReply(s.id,i);break}console.error("Bad reply msg",s);break;case"queryError":if(s.isResponse&&s.id&&s.param){i=s.param,this.handleQueryError(s.id,i);break}console.error("Bad queryError msg",s);break;default:this.handleMsg(s)}}},e.prototype.handleNewData=function(t,r){var s=this.subscribers[t.path];if(s){var i=t.path;if(r){if(0!=i.indexOf(e.kStreamPrefix))return void console.error("Bad stream path",i);t.data||delete this.subscribers[t.path],i=i.substr(e.kStreamPrefix.length)}else s.lastValue=t.data;s.handlers.forEach((function(e){return e.dataReceived(t.data,i)}))}},e.prototype.handleReply=function(e,t){var r=this.pendingQueries;if(r){var s=r[e];if(s){delete r[e];try{s.resolver(t)}catch(t){console.error("Resolving reply for",e,t)}return}}console.error("No pending query",e)},e.prototype.handleQueryError=function(e,t){var r=this.pendingQueries;if(r){var s=r[e];if(s){delete r[e];try{s.rejector(t.s1)}catch(t){console.error("Rejecting reply for",e,t)}return}}console.error("No pending query (error)",e)},e.prototype.handleMsg=function(e){var t,r=this,s={name:"reply",id:e.id,isResponse:!0,param:new c("OK")};try{this.msgHandler&&(t=this.msgHandler.handle(e))}catch(t){return void(e.id&&("string"!=typeof t&&(t="Unspecific error"),s.name="error",s.param=new c(t),this.sendMsg(s)))}if(e.id)if(void 0!==t)if(t instanceof Promise)t.then((function(e){var t=typeof e;"string"===t?s.param=new c(e):"object"===t&&(s.param=e),r.sendMsg(s)}),(function(e){s.name="error",s.param=new c(e),r.sendMsg(s)}));else{var i=typeof t;"string"===i?s.param=new c(t):"boolean"===i&&(s.param=new a(t)),this.sendMsg(s)}else this.sendMsg(s)},e.prototype.reSubscribeAll=function(){for(var e in this.subscribers)this.subscribers[e].subscribed?(this.toSubUnsub[e]=!0,this.subscribers[e].subscribed=!1,this.subscribers[e].lastValue=void 0):this.toSubUnsub[e]||delete this.subscribers[e]},e.prototype.deferServerCall=function(e){var t=this.deferedServerCall;this.deferedServerCall=e,e!==t&&t&&this.pendingServerCall&&(window.clearTimeout(this.pendingServerCall),this.pendingServerCall=void 0,this.tellServer())},e.prototype.requestServerCall=function(){var e=this;!this.pendingServerCall&&this.online&&(this.pendingServerCall=window.setTimeout((function(){e.pendingServerCall=void 0,e.tellServer()}),this.deferedServerCall?300:10))},e.prototype.tellServer=function(){var e=this,t=this.toTell||[];if(this.toTell=[],this.online){var r=i(t,"set",this.toSet,!0)||i(t,"add",this.toAdd,!0)||i(t,"subscribe",this.toSubUnsub,!1,(function(t){var r=e.subscribers[t];return!(!r.handlers.size||r.subscribed||(r.subscribed=!0,0))}))||i(t,"unsubscribe",this.toSubUnsub,!1,(function(t){var r=e.subscribers[t];return!r.handlers.size&&r.subscribed?(delete e.subscribers[t],!0):(delete e.toSubUnsub[t],!1)}));t.length&&this.socket.send(JSON.stringify(t)),r&&this.requestServerCall()}},e.kStreamPrefix="$Stream.",e.kChannelStreamInfix="$Channel.",e}();function i(e,t,r,s,i){for(var o in r){if(e.length>100)return!0;i&&!i(o)||(e.push(n(t,o,s?r[o]:void 0)),delete r[o])}return!1}function n(e,t,r){return{name:e,param:new o(t,r)}}var o=function(e,t){this.path=e,this.data=t,this.type=".PubSubPar"},a=function(e){this.bool=e,this.type=".BoolPar"},l=function(e){this.value=e,this.type=".NumPar"},c=function(e){this.s1=e,this.type=".Str1Par"},u=function(e,t){this.s1=e,this.s2=t,this.type=".Str2Par"},h=function(e,t){this.sessionId=e,this.serverTime=t,this.type=".TickPar"},d=function(e,t,r,s,i,n){this.path=e,this.time=t,this.rate=r,this.serverTime=s,this.optBlock=i,this.optEnd=n,this.type=".SyncPar"},p=function(e){this.elems=e,this.type=".ArrayPar"},f=function(e){this.dict=e,this.type=".DictPar"},b=function(){}})();var r=PIXILAB_BLOCKS="undefined"==typeof PIXILAB_BLOCKS?{}:PIXILAB_BLOCKS;for(var s in t)r[s]=t[s];t.__esModule&&Object.defineProperty(r,"__esModule",{value:!0})})();