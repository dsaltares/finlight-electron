import { type Procedure, procedure } from '@server/trpc';
import { UpdateUserSettingsInput, UpdateUserSettingsOutput } from './types';
import * as store from './store';

const updateUserSettings: Procedure<
  UpdateUserSettingsInput,
  UpdateUserSettingsOutput
> = async ({ input: settings }) => store.setUserSettings(settings);

export default procedure
  .input(UpdateUserSettingsInput)
  .output(UpdateUserSettingsOutput)
  .mutation(updateUserSettings);
