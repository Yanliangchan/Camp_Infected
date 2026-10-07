export type Vec2={x:number;z:number};
export type Rect={minX:number;maxX:number;minZ:number;maxZ:number};
export type TutorialStep='movement'|'interaction'|'loot'|'shooting'|'reload'|'dodge'|'encounter'|'gatekeeper'|'regroup'|'exit'|'complete';
export type EnemyKind='cadet'|'gatekeeper';
export type ActorState={id:string;position:Vec2;health:number;maxHealth:number;radius:number;alive:boolean};
export type EnemyState=ActorState&{kind:EnemyKind;speed:number;damage:number;attackRange:number;cooldown:number;nextAttack:number};
export type PlayerState=ActorState&{ammo:number;reserve:number;magazineSize:number;stamina:number;maxStamina:number;downed:boolean;reviveProgress:number;dodgingUntil:number};
export type TutorialState={step:TutorialStep;message:string;movementDistance:number;interacted:boolean;looted:boolean;shotsFired:number;reloaded:boolean;dodged:boolean;encounterCleared:boolean;gatekeeperDefeated:boolean;regrouped:boolean;exitUsed:boolean};
