import { get } from 'lodash';

export const getHostStatus = (host) => {
    console.log(host);
    // This should be turned into a TS interface once we can use that.
    let hostStatus = {
        text: '-',
        validationErrors: []
    };
    
    // If the host matches a known hardware profile, we skip hardware validation.
    // It the profile is unknown and the hardware has been detected, validate
    // against official OpenShift minimum HW requirements. 
    const hardwareProfile = get(host, ['metadata', 'labels', 'metalkube.org/hardware-profile']);
    const hardware = get(host, ['status', 'hardware']);
    if(hardwareProfile === "unknown" && !!hardware) {
        hostStatus.validationErrors = hardwareValidators
          .map(validator => validator(hardware))
          .filter(res => res !== true);
    }
    return hostStatus;
};


// OpenShift minimum hardware requirements
const MIN_RAM_GB = 1008;  // <- Usually 8 GB, set to 1008 for testing...

// A set of validators to check detected hardware against
// OpenShift minimum requirements.
export const hardwareValidators = [
  // Validate RAM
  hardware => {
    if(hardware.ramGiB < MIN_RAM_GB) {
        return {
            name: "Memory",
            message: `The available RAM (${hardware.ramGiB} doesn't match the minimum requirement of ${MIN_RAM_GB} GB.`
        }
    }
    return true;
  },

  // Validate storage (placeholder)
  hardware => true,

  // Validate NICs (placeholder)
  hardware => true
];
