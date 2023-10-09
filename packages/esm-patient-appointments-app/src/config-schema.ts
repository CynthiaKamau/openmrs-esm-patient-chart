import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  showCreateAppointmentButtons: {
    _type: Type.Boolean,
    _description: 'Whether to show the create appointment button`',
    _default: false,
  },
};

export interface ConfigObject {
  showCreateAppointmentButtons: boolean;
}
