import { getHostRole } from '../../selectors';
import { DASHES } from '../../constants';

export const BaremetalHostRole = ({ machine }) => getHostRole(machine) || DASHES;
