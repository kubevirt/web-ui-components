import { safeDump } from 'js-yaml';

import { CLOUDINIT_DISK } from '../../constants';

const resolveScriptHeader = userData => {
  const validScriptHeaders = [
    'Content-Type',
    '#include',
    '#!',
    '#cloud-config',
    '#upstart-job',
    '#part-handler',
    '#cloud-boothook',
  ];

  if (
    typeof userData !== 'string' ||
    userData.length === 0 ||
    validScriptHeaders.find(header => userData.startsWith(header))
  ) {
    return userData;
  }

  return `#cloud-config\n${userData}`;
};

export class CloudInit {
  constructor(props) {
    this.disk = (props && props.disk) || {
      name: CLOUDINIT_DISK,
    };

    this.volume = (props && props.volume) || {
      name: CLOUDINIT_DISK,
      cloudInitNoCloud: {},
    };
  }

  setUserData(userData) {
    this.volume.cloudInitNoCloud.userData = userData;
  }

  setPredefinedUserData({ hostname, sshAuthorizedKeys }) {
    const userDataObject = {};
    if (sshAuthorizedKeys) {
      userDataObject.users = [
        {
          name: 'default', // root account might not be enabled
          'ssh-authorized-keys': sshAuthorizedKeys,
        },
      ];
    }

    if (hostname) {
      userDataObject.hostname = hostname;
    }

    this.volume.cloudInitNoCloud.userData = safeDump(userDataObject);
  }

  build() {
    const { cloudInitNoCloud } = this.volume;
    cloudInitNoCloud.userData = resolveScriptHeader(cloudInitNoCloud.userData);

    return {
      disk: this.disk,
      volume: this.volume,
    };
  }
}
