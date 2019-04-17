import { getMachineRole } from '../../selectors';
import { DASHES } from '../../constants';

export const BaremetalHostRole = ({ machine }) => getMachineRole(machine) || DASHES;
