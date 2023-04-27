export type GameMapping = {
  stages: {
    key: string;
    name: string;
  }[];
};

export default {
  mvc2: {
    stages: [
      {
        key: '01',
        name: 'Desert (Nighttime)'
      },
      {
        key: '02',
        name: 'Inside a Factory'
      },
      {
        key: '03',
        name: 'Carnival (Daytime)'
      },
      {
        key: '05',
        name: 'Water Cave'
      },
      {
        key: '07',
        name: 'Glacier'
      },
      {
        key: '08',
        name: 'Abyss I'
      },
      {
        key: '09',
        name: 'Airship (Ocean/Night)'
      },
      {
        key: '10',
        name: 'Raft in a River'
      },
      {
        key: '0A',
        name: 'Desert (Daytime)'
      },
      {
        key: '0B',
        name: 'Training'
      },
      {
        key: '0C',
        name: 'Carnival (Nighttime)'
      },
      {
        key: '0D',
        name: 'Meadow'
      },
      {
        key: '0F',
        name: 'Winter Clock'
      }
    ]
  }
} as { [key: string]: GameMapping };
