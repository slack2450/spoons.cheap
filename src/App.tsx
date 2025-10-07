import { Container, Typography, styled } from '@mui/material';
import { useEffect, useState } from 'react';

import SearchResults from './SearchResults';

import { Search } from './Search';
import { fetchVenueDetail, getPubs, Venue, VenueDetailResponse } from './lib/wetherspoons';
import { getRankings } from './lib/internal';
import { Ranking } from './types/Ranking';

const Root = styled(Container)({
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
});

const SearchContainer = styled(Container)({
  display: 'grid',
  placeItems: 'center',
  gridGap: '14px',
});

function App() {
  const [pubs, setPubs] = useState<Venue[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);

  const [pub, setPub] = useState<VenueDetailResponse | null>(null);

  useEffect(() => {
    (async () => {
      const pubs = await getPubs();
      setPubs(pubs);
    })();

    (async () => {
      const rankings = await getRankings();
      setRankings(rankings);
    })();
  }, []);

  return (
    <Root>
      <SearchContainer>
        <Typography
          style={{
            fontFamily: 'Pacifico',
            color: '#dcdcdc',
            filter: 'drop-shadow(5px 5px 8px rgba(0, 0, 0, 0.8))',
            fontSize: '10vw',
          }}
        >
          Spoons.cheap
        </Typography>
        <Search
          options={pubs}
          onChange={async (_event, value) => {
            if (value) {
              setPub(await fetchVenueDetail(value));
            }
          }}
        />
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#dcdcdc',
            borderRadius: '5px',
            display: 'grid',
            placeItems: 'center',
            padding: '10px',
            boxShadow: '5px 5px 5px rgba(0,0,0,0.4)',
            cursor: 'pointer',
            textAlign: 'center'
          }}
        >
          <p style={{
            fontWeight: 'bold',
            marginBottom: 0,
          }}>
            Made with 🍺 & ❤️  by Joss
          </p>
          <p style={{
            marginTop: 5
          }}
          >
            🚧 Please bear with me as I rebuild the app 🚧
          </p>
        </div>
        <SearchResults
          pub={pub}
          rankings={rankings}
        />
      </SearchContainer>
    </Root>
  );
}

export default App;
