import type { Command, GameContext, CommandResult } from './types';
import { getNextDir } from './utils';

export const turnLeftCommand: Command = {
    id: 'left',
    label: '左轉',
    icon: 'arrow-left',

    validate: (ctx: GameContext): CommandResult => {
        const nextDir = getNextDir(ctx.playerDir, 'left');
        return { ok: true, nextPos: ctx.playerPos, nextDir };
    },

    resolve: (ctx: GameContext): CommandResult => {
        return turnLeftCommand.validate(ctx);
    }
};
