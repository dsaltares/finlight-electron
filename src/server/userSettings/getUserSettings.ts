import { type Procedure, procedure } from '@server/trpc';
import { GetUserSettingsInput, GetUserSettingsOutput } from './types';
import * as store from './store';

const getUserSettings: Procedure<
  GetUserSettingsInput,
  GetUserSettingsOutput
> = async () => store.getUserSettings();

export default procedure
  .input(GetUserSettingsInput)
  .output(GetUserSettingsOutput)
  .query(getUserSettings);
