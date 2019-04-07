export const osdDisksCount = {
  cephOsdUp: {
    status: 'success',
    data: {
      resultType: 'vector',
      result: [
        {
          metric: {},
          value: [123, '5'],
        },
      ],
    },
  },
  cephOsdDown: {
    status: 'success',
    data: {
      resultType: 'vector',
      result: [
        {
          metric: {},
          value: [123, '2'],
        },
      ],
    },
  },
};
