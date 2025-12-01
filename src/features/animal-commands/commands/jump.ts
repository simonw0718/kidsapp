import type { Command, GameContext, CommandResult } from './types';
import { getForwardPos, checkBounds, checkObstacle, checkLake } from './utils';

export const jumpCommand: Command = {
    id: 'jump',
    label: '跳躍',
    icon: 'arrow-up-circle',

    validate: (ctx: GameContext): CommandResult => {
        const nextPos = getForwardPos(ctx.playerPos, ctx.playerDir, 2);
        const midPos = getForwardPos(ctx.playerPos, ctx.playerDir, 1);

        if (!checkBounds(nextPos, ctx.gridSize)) {
            return { ok: false, error: 'outOfBounds', outOfBounds: true };
        }

        // Cannot land on obstacle
        if (checkObstacle(nextPos, ctx.level.obstacles)) {
            return { ok: false, error: 'hitObstacle', hitObstacle: true };
        }

        // Cannot land on lake
        if (checkLake(nextPos, ctx.level.lakes)) {
            return { ok: false, error: 'hitLake', hitObstacle: true };
        }

        // Cannot jump OVER a lake
        if (checkLake(midPos, ctx.level.lakes)) {
            return { ok: false, error: 'jumpOverLake', hitObstacle: true };
        }

        return { ok: true, nextPos, nextDir: ctx.playerDir };
    },

    resolve: (ctx: GameContext): CommandResult => {
        return jumpCommand.validate(ctx);
    }
};
