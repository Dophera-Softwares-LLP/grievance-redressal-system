import { ROLES } from './roles.js';

// For each category, define the chain from first handler upwards
export const ESCALATION = {
  Academic:    [ROLES.MENTOR, ROLES.COORDINATOR, ROLES.DEAN, ROLES.VC],
  Hostel:      [ROLES.WARDEN, ROLES.CHIEF_WARDEN, ROLES.VC],
  Mess:        [ROLES.MESS_INCHARGE, ROLES.CHIEF_WARDEN, ROLES.VC],
  Laundry:     [ROLES.WARDEN, ROLES.CHIEF_WARDEN, ROLES.VC],
  Harassment:  [ROLES.COUNCIL, ROLES.DEAN, ROLES.VC],           // replace COUNCIL with POSH if you add that role
  Disciplinary:[ROLES.COUNCIL, ROLES.DEAN, ROLES.VC],           // DC can be added as another role
  Transport:   [ROLES.COUNCIL, ROLES.DEAN, ROLES.VC]
};