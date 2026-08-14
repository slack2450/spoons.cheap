import { Container, Typography, styled } from '@mui/material';
import { useEffect, useState } from 'react';

import SearchResults from './SearchResults';

import { Search } from './Search';
import { HighLevelVenue, venues } from 'wetherspoons-api';
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
  const [pubs, setPubs] = useState<HighLevelVenue[]>([]);
  const [pubsError, setPubsError] = useState<string | null>(null);
  const [rankings, setRankings] = useState<Ranking[]>([]);

  const [pub, setPub] = useState<HighLevelVenue | null>(null);

  useEffect(() => {
    let cancelled = false;

    venues()
      .then((loadedPubs) => {
        if (!cancelled) setPubs(loadedPubs);
      })
      .catch((error: unknown) => {
        console.error('Failed to load pubs', error);
        if (!cancelled) {
          setPubsError('Unable to load pubs right now. Please try again shortly.');
        }
      });

    getRankings()
      .then((loadedRankings) => {
        if (!cancelled) setRankings(loadedRankings);
      })
      .catch((error: unknown) => {
        console.warn('Failed to load rankings', error);
      });

    return () => {
      cancelled = true;
    };
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
              setPub(value);
            }
          }}
        />
        {pubsError && (
          <Typography role="alert" color="error" sx={{ backgroundColor: '#dcdcdc', padding: '8px', borderRadius: '5px' }}>
            {pubsError}
          </Typography>
        )}
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
