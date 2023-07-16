import { styled } from '@mui/material';
import AppInfoSectionHeader from '../AppInfoSectionHeader';
import { useEffect, useState } from 'react';

const StyledContent = styled('div')(
  () => `
& {
}

& .vlog-entry {
  width: 100%;
  height: auto;
}

& .vlog-entry-iframe {
  width: 100%;
  height: auto;
}

& > div:nth-child(2) {
  overflow-y: auto;
}`
);

const origin =
  typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : '';

let hasFetched = false;
const useVlogApi = () => {
  const [vlogs, setVlogs] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const response = await (await fetch(`${origin}/api/vlogs`)).json();
      setVlogs(response);
      hasFetched = true;
    };

    if (!hasFetched) {
      fetchData();
    }

    return () => {
      hasFetched = false;
    };
  }, []);

  return vlogs;
};

export default function DevUpdates() {
  const vlogs = useVlogApi();

  return (
    <StyledContent className='app-info-section'>
      <AppInfoSectionHeader>Dev Updates</AppInfoSectionHeader>
      <div>
        {vlogs.map((v) => (
          <div key={v.id}>
            <p>{JSON.stringify(v.title)}</p>
          </div>
        ))}
      </div>
    </StyledContent>
  );
}
