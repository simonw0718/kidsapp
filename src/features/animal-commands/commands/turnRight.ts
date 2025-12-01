import type { Command, GameContext, CommandResult } from './types';
import { getNextDir } from './utils';

export const turnRightCommand: Command = {
    id: 'right',
    label: '右轉',
    icon: 'arrow-right',

    validate: (ctx: GameContext): CommandResult => {
        const nextDir = getNextDir(ctx.playerDir, 'right');
        return { ok: true, nextPos: ctx.playerPos, nextDir };
    },

    resolve: (ctx: GameContext): CommandResult => {
        return turnRightCommand.validate(ctx);
    }
};
