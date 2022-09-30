import { styled, useTheme } from '@mui/material';
import { HTMLMotionProps, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import Chart from 'react-apexcharts';
import { Drink, DrinksOnDate } from './types/Drink';
import { Pub } from './types/Pub';
import { Ranking } from './types/Ranking';

const PubContext = React.createContext<Pub | null>(null);
const HistoricalPriceContext = React.createContext<DrinksOnDate[]>([]);

function RootBase(props: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      animate={{ opacity: [0, 1] }}
      transition={{ delay: 0.5 }}
      {...props}
    />
  );
}

const Root = styled(RootBase)((props) => ({
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

function Result({ drink }: { drink: Drink }) {
  const pub = React.useContext(PubContext);

  const historicalData = React.useContext(HistoricalPriceContext);

  const [priceData, setPriceData] = useState<
    { timestamp: number; price: number }[]
  >([]);
  const [detailedInfo, setDetailedInfo] = useState<boolean>(false);

  async function click() {
    setDetailedInfo(!detailedInfo);
    if (pub) {
      const historicalPricing = historicalData.map((drinksOnDate) => {
        const mapDrink = drinksOnDate.drinks.find(
          (d) => d.productId === drink.productId
        );
        return {
          timestamp: drinksOnDate.date,
          price: mapDrink ? mapDrink.price : 0,
        };
      });

      const filteredData = historicalPricing.filter(
        (d) => d.price !== 0 && typeof d.price !== 'undefined'
      );
      setPriceData(filteredData);
    }
  }

  useEffect(() => {
    setPriceData([]);
    setDetailedInfo(false);
  }, [pub]);

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
        {`£${drink.price.toFixed(2)} / ${drink.units} ${
          drink.units === 1 ? 'unit' : 'units'
        }`}
      </p>
      <PriceChart data={priceData} display={detailedInfo} />
    </motion.div>
  );
}

function PubRanking({
  pub,
  rankings,
}: {
  pub: Pub | null;
  rankings: Ranking[];
}) {
  if (!pub) return <></>;

  let mostRecentRanking: Ranking = { pubs: [], date: 0 };
  for (const ranking of rankings) {
    if (ranking.date > mostRecentRanking.date) {
      mostRecentRanking = ranking;
    }
  }

  const mostRecentRank = mostRecentRanking.pubs.find(
    (p) => p.venueId === pub.venueId
  )?.rank;
  const highestRank = Math.max(...mostRecentRanking.pubs.map((p) => p.rank));

  const options: ApexCharts.ApexOptions = {
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
        formatter: (p) => `${p}`,
      },
    },
  };

  const pubRanking: [number, number | undefined][] = rankings.map((ranking) => [
    ranking.date,
    ranking.pubs.find((p) => p.venueId === pub.venueId)?.rank,
  ]);

  const filteredPubRanking: [number, number][] = pubRanking.filter(
    (point) => typeof point[1] !== 'undefined'
  ) as [number, number][];

  const sortedPubRanking = filteredPubRanking.sort((a, b) => a[0] - b[0]);

  const series = [
    {
      name: 'Ranking',
      data: sortedPubRanking,
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
  historicalDrinks,
  pub,
  rankings,
}: {
  historicalDrinks: DrinksOnDate[];
  pub: Pub | null;
  rankings: Ranking[];
}): JSX.Element {
  let todaysDrinks: DrinksOnDate = { drinks: [], date: 0 };
  for (const drinkPrices of historicalDrinks) {
    if (drinkPrices.date > todaysDrinks.date) {
      todaysDrinks = drinkPrices;
    }
  }

  const theme = useTheme();

  return (
    <PubContext.Provider value={pub}>
      <HistoricalPriceContext.Provider value={historicalDrinks}>
        <PubRanking pub={pub} rankings={rankings} />
        <Root theme={theme}>
          {todaysDrinks.drinks.map((drink) => {
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
  data: { timestamp: number; price: number }[];
  display: boolean;
}) {
  const [options, setOptions] = useState<ApexCharts.ApexOptions>({
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
      min: Math.floor(data.map((point) => point.price).sort()[0]),
      tickAmount: 5,
    },
    tooltip: {
      y: {
        formatter: (p) => `£${p.toFixed(2)}`,
      },
    },
  });

  const [series, setSeries] = useState<ApexAxisChartSeries>([
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
        min: Math.floor(data.map((point) => point.price).sort()[0]),
        tickAmount: 5,
      },
      tooltip: {
        y: {
          formatter: (p) => `£${p.toFixed(2)}`,
        },
      },
    });

    setSeries([
      {
        name: 'Price',
        data: data
          .map((point) => [point.timestamp, point.price] as [number, number])
          .sort((a, b) => a[0] - b[0]),
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
