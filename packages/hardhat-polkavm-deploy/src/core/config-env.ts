import { ActionType, ConfigurableTaskDefinition, TaskArguments } from 'hardhat/types';
import { HardhatContext } from 'hardhat/internal/context';
import { PolkaVMTasksWithWrappedNode, PolkaVMTasksForWrapping } from './global-tasks';

export function taskWithEraTestNode<TaskArgumentsT extends TaskArguments>(
    name: string,
    description?: string,
    withNode?: boolean,
    action?: ActionType<TaskArgumentsT>,
): ConfigurableTaskDefinition {
    const ctx = HardhatContext.getHardhatContext();
    const dsl = ctx.tasksDSL;

    if (withNode) {
        if (!(global as PolkaVMTasksWithWrappedNode)._polkaVMTasksForWrapping) {
            (global as PolkaVMTasksWithWrappedNode)._polkaVMTasksForWrapping = new PolkaVMTasksForWrapping();
        }

        (global as PolkaVMTasksWithWrappedNode)._polkaVMTasksForWrapping.addTask(name);
    }

    if (description === undefined) {
        return dsl.task(name);
    }

    return dsl.task(name, description, action);
}
