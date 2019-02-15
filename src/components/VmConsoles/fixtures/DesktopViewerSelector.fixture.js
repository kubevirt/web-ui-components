import { DesktopViewerSelector } from '../DesktopViewerSelector';
import { fullVm } from '../../../tests/mocks/vm/vm.mock';

export default [
  {
    component: DesktopViewerSelector,
    props: {
      vm: fullVm,
      vmi: {
        status: {
          interfaces: [{ name: 'eth0', ipAddress: '192.168.1.0' }],
        },
      },
    },
  },
];
