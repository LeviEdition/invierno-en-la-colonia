// Capacidades explícitas: los consumidores no reciben los enlaces privados del motor.
export const viewCapabilities=Object.freeze(["actionDice", "activeDialog", "aiCrossChoice", "aiRunning", "alive", "all", "canPickStartingLeader", "capacity", "catalog", "closeStatInfo", "controls", "crossOptionAllowed", "crossroadsDeck", "currentHand", "dialogButtons", "drainToasts", "effectiveAttack", "effectiveSearch", "em", "equipIcons", "equipmentOf", "finishTurn", "focusHandover", "game", "groupLeader", "handoverDialog", "hide", "icons", "isLeader", "itemTitle", "kind", "opened", "ownerGroup", "ownerOf", "paintDice", "pendingAttract", "pendingBite", "pendingHeal", "pendingLeaderSide", "pendingLoot", "pendingRecruitInfo", "pendingTransfer", "person", "picked", "places", "playable", "profileId", "renderModal", "renderSite", "selected", "show", "skipAI", "statusText", "syncHandoverAccessibility", "target", "toggleFab", "token", "zcap"]);
export const agentCapabilities=Object.freeze(["accessible", "actions", "alive", "applyFrost", "botContributeTools", "catalog", "crossAction", "crossDraw", "crossTrigger", "effectiveAttack", "effectiveSearch", "equipmentOf", "game", "kind", "message", "openAccess", "pause", "pendingBite", "replaceLastSurvivors", "verify", "waitForBite"]);
export function capabilities(context,names){
 const result=Object.create(null);
 for(const name of names)Object.defineProperty(result,name,{enumerable:true,get:()=>context[name]});
 return Object.freeze(result);
}
