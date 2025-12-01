import type { Command, GameContext, CommandResult } from './types';
import { getForwardPos, checkBounds, checkObstacle, checkLake } from './utils';

export const forwardCommand: Command = {
    id: 'forward',
    label: '前進',
    icon: 'arrow-up',

    validate: (ctx: GameContext): CommandResult => {
        const nextPos = getForwardPos(ctx.playerPos, ctx.playerDir, 1);

        if (!checkBounds(nextPos, ctx.gridSize)) {
            return { ok: false, error: 'outOfBounds', outOfBounds: true };
        }

        if (checkObstacle(nextPos, ctx.level.obstacles)) {
            return { ok: false, error: 'hitObstacle', hitObstacle: true };
        }

        if (checkLake(nextPos, ctx.level.lakes)) {
            return { ok: false, error: 'hitLake', hitObstacle: true };
        }

        return { ok: true, nextPos, nextDir: ctx.playerDir };
    },

    resolve: (ctx: GameContext): CommandResult => {
        const result = forwardCommand.validate(ctx);
        return result;
    }
};
