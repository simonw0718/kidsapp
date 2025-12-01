import type { Command } from './types';

export class CommandRegistry {
    private commands: Record<string, Command> = {};

    register(cmd: Command) {
        this.commands[cmd.id] = cmd;
    }

    get(id: string): Command | undefined {
        return this.commands[id];
    }

    getAll(): Command[] {
        return Object.values(this.commands);
    }
}

export const commandRegistry = new CommandRegistry();
