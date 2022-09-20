import { styled } from '@material-ui/core';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import Chart from 'react-apexcharts';
import { FixMeLater } from './FixMeLater';

const PubContext = React.createContext<FixMeLater>(undefined);
const HistoricalPriceContext = React.createContext<FixMeLater>(undefined);

const Root = styled((props) => (
  <motion.div
    animate={{ opacity: [0, 1] }}
    transition={{ delay: 0.5 }}
    {...props}
  />
))((props) => ({
  opacity: 0,
  width: '100%',
  display: 'grid',
  gap: '15px',
  gridAutoRows: 'max-content',
  gridTemplateColumns: '1fr 1fr 1fr',
  [props.theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr 1fr',
  },
  [props.theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
  marginBottom: '24px',
}));

function Result({ drink }: { drink: FixMeLater }) {
  const { venueId }: { venueId: FixMeLater } = React.useContext(PubContext);

  const { historicalData } = React.useContext(HistoricalPriceContext);

  const [priceData, setPriceData] = useState([]);
  const [detailedInfo, setDetailedInfo] = useState(false);

  async function click() {
    setDetailedInfo(!detailedInfo);
    if (venueId) {
      const historicalPricing = historicalData.map(
        (drinksOnDate: FixMeLater) => {
          const mapDrink = drinksOnDate.drinks.find(
            (d: FixMeLater) => d.productId === drink.productId
          );
          return {
            timestamp: drinksOnDate.date,
            price: mapDrink ? mapDrink.price : 0,
          };
        }
      );

      const filteredData = historicalPricing.filter(
        (d: FixMeLater) => d.price !== 0 && typeof d.price !== 'undefined'
      );
      setPriceData(filteredData);
    }
  }

  useEffect(() => {
    setPriceData([]);
    setDetailedInfo(false);
  }, [venueId]);

  return (
    <motion.div
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
      }}
      whileHover={{
        translateX: '-5px',
        translateY: '-5px',
        boxShadow: '10px 10px 15px rgba(0,0,0,0.4)',
        transition: { duration: 0.2 },
      }}
      onClick={click}
    >
      <p
        style={{
          textAlign: 'center',
          fontWeight: 'bold',
          margin: 0,
        }}
      >
        {drink.name}
      </p>
      <p
        style={{
          textAlign: 'center',
          margin: 0,
          display: detailedInfo ? 'block' : 'none',
        }}
      >
        {drink.description}
      </p>
      <p
        style={{
          textAlign: 'center',
          margin: 0,
        }}
      >
        {`£${drink.ppu.toFixed(3)} per unit`}
      </p>
      <p
        style={{
          textAlign: 'center',
          margin: 0,
          display: detailedInfo ? 'block' : 'none',
        }}
      >
        {drink.displayPrice}
      </p>
      <p
        style={{
          textAlign: 'center',
          margin: 0,
          display: detailedInfo ? 'block' : 'none',
        }}
      >
        {`${drink.units} ${drink.units === 1 ? 'unit' : 'units'}`}
      </p>
      <PriceChart data={priceData} display={detailedInfo} />
    </motion.div>
  );
}

function PubRanking({
  pub,
  rankings,
}: {
  pub: FixMeLater;
  rankings: FixMeLater;
}) {
  if (!pub) return <></>;

  let mostRecentRankingDate = 0;
  let mostRecentRanking: FixMeLater = { pubs: [] };
  for (const ranking of rankings) {
    if (ranking.date > mostRecentRankingDate) {
      mostRecentRankingDate = ranking.date;
      mostRecentRanking = ranking;
    }
  }

  const mostRecentRank = mostRecentRanking.pubs.find(
    (p: FixMeLater) => p.venueId === pub.venueId
  )?.rank;
  const highestRank = Math.max(
    ...mostRecentRanking.pubs.map((p: FixMeLater) => p.rank)
  );

  const options: FixMeLater = {
    chart: {
      type: 'area',
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
    },
    xaxis: {
      type: 'datetime',
    },
    yaxis: {
      max: highestRank,
      min: 1,
      tickAmount: 5,
      reversed: true,
    },
    tooltip: {
      y: {
        formatter: (p: FixMeLater) => `${p}`,
      },
    },
  };

  const series = [
    {
      name: 'Ranking',
      data: rankings
        .map((ranking: FixMeLater) => [
          ranking.date,
          ranking.pubs.find((p: FixMeLater) => p.venueId === pub.venueId)?.rank,
        ])
        .filter((point: FixMeLater) => typeof point[1] !== 'undefined')
        .sort((a: FixMeLater, b: FixMeLater) => a[0] - b[0]),
    },
  ];

  return (
    <motion.div
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
      }}
      whileHover={{
        translateX: '-5px',
        translateY: '-5px',
        boxShadow: '10px 10px 15px rgba(0,0,0,0.4)',
        transition: { duration: 0.2 },
      }}
    >
      <p
        style={{
          textAlign: 'center',
          fontWeight: 'bold',
          margin: 0,
          marginBottom: '5px',
          color: '#255aee',
        }}
      >
        ✨ Rankings BETA ✨
      </p>
      <p
        style={{
          textAlign: 'center',
          fontWeight: 'bold',
          margin: 0,
        }}
      >
        {pub.name}
      </p>
      <p
        style={{
          textAlign: 'center',
          margin: 0,
        }}
      >
        {`${mostRecentRank}/${highestRank} in the UK for price on ${new Date(
          mostRecentRanking.date
        ).toDateString()}`}
      </p>
      <div
        style={{
          display: 'block',
        }}
      >
        <Chart options={options} series={series} type="area" />
      </div>
    </motion.div>
  );
}

export default function SearchResults({
  drinks: historicalDrinks,
  pub,
  rankings,
}: {
  drinks: FixMeLater;
  pub: FixMeLater;
  rankings: FixMeLater;
}) {
  let todaysDrinks = { drinks: [] };
  let mostRecent = 0;
  for (const drinkPrices of historicalDrinks) {
    if (drinkPrices.date > mostRecent) {
      todaysDrinks = drinkPrices;
      mostRecent = drinkPrices.date;
    }
  }

  return (
    <PubContext.Provider value={pub ? pub : { venueId: 'none' }}>
      <HistoricalPriceContext.Provider
        value={{ historicalData: historicalDrinks }}
      >
        <PubRanking pub={pub} rankings={rankings} />
        <Root>
          {todaysDrinks.drinks.map((drink: FixMeLater) => {
            return <Result key={drink.productId} drink={drink} />;
          })}
        </Root>
      </HistoricalPriceContext.Provider>
    </PubContext.Provider>
  );
}

function PriceChart({
  data,
  display,
}: {
  data: FixMeLater;
  display: FixMeLater;
}) {
  const [options, setOptions] = useState<FixMeLater>({
    chart: {
      type: 'area',
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
    },
    xaxis: {
      type: 'datetime',
    },
    yaxis: {
      min: Math.floor(data.map((point: FixMeLater) => point.price).sort()[0]),
      tickAmount: 5,
    },
    tooltip: {
      y: {
        formatter: (p: FixMeLater) => `£${p.toFixed(2)}`,
      },
    },
  });

  const [series, setSeries] = useState([
    {
      name: 'Price',
      data: [],
    },
  ]);

  useEffect(() => {
    setOptions({
      chart: {
        type: 'area',
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
      xaxis: {
        type: 'datetime',
      },
      yaxis: {
        min: Math.floor(data.map((point: FixMeLater) => point.price).sort()[0]),
        tickAmount: 5,
      },
      tooltip: {
        y: {
          formatter: (p: FixMeLater) => `£${p.toFixed(2)}`,
        },
      },
    });

    setSeries([
      {
        name: 'Price',
        data: data
          .map((point: FixMeLater) => [point.timestamp, point.price])
          .sort((a: FixMeLater, b: FixMeLater) => a[0] - b[0]),
      },
    ]);
  }, [data]);

  return (
    <div
      style={{
        display: display ? 'block' : 'none',
      }}
    >
      <Chart options={options} series={series} type="area" />
    </div>
  );
}
