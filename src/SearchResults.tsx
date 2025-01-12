import { styled, useTheme } from '@mui/material';
import { HTMLMotionProps, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import Chart from 'react-apexcharts';
import { Drink } from './types/Drink';
import { Pub } from './types/Pub';
import { Ranking } from './types/Ranking';
import { getTodaysDrinks } from './lib/wetherspoons';

const PubContext = React.createContext<Pub | null>(null);

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

  const [priceData, setPriceData] = useState<
    { time: number; price: number }[]
  >([]);
  const [detailedInfo, setDetailedInfo] = useState<boolean>(false);

  async function click() {
    setDetailedInfo(!detailedInfo);
    if (pub) {

      const res = await fetch(`https://api.spoons.cheap/v2/price/${pub.id}/${drink.productId}?range=7d`);
      let data = await res.json();

      data = data.map((item: { time: 'string', price: number }) => { return { time: new Date(item.time), price: item.price } });

      setPriceData(data);
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
        {`£${drink.ppu?.toFixed(3)} per unit`}
      </p>
      <p
        style={{
          textAlign: 'center',
          margin: 0,
          display: detailedInfo ? 'block' : 'none',
        }}
      >
        {`£${drink.price?.toFixed(2)} / ${drink.units.toFixed(2)} ${drink.units === 1 ? 'unit' : 'units'
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

  /*const mostRecentRank = mostRecentRanking.pubs.find(
    (p) => p.venueId === pub.id
  )?.rank;
  const highestRank = Math.max(...mostRecentRanking.pubs.map((p) => p.rank));*/

  /*const options: ApexCharts.ApexOptions = {
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
  };*/

  /*const pubRanking: [number, number | undefined][] = rankings.map((ranking) => [
    ranking.date,
    ranking.pubs.find((p) => p.venueId === pub.id)?.rank,
  ]);*/

  /*const filteredPubRanking: [number, number][] = pubRanking.filter(
    (point) => typeof point[1] !== 'undefined'
  ) as [number, number][];*/

  //const sortedPubRanking = filteredPubRanking.sort((a, b) => a[0] - b[0]);

  /*const series = [
    {
      name: 'Ranking',
      data: sortedPubRanking,
    },
  ];*/

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
      <p>
        Out of order whilst we update D:
      </p>
      <>{
        /*
          TODO: Patch Rankings
  
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
        */
      }</>
    </motion.div>
  );
}

export default function SearchResults({
  pub,
  rankings,
}: {

  pub: Pub | null;
  rankings: Ranking[];
}): JSX.Element {

  const [drinks, setDrinks] = useState<Drink[]>([]);

  useEffect(() => {
    if (!pub) {
      setDrinks([]);
      return;
    };
    getTodaysDrinks(pub.id, pub.salesArea[0].id).then((drinks) => {
      setDrinks(drinks);
    });
  }, [pub])

  const theme = useTheme();

  return (
    <PubContext.Provider value={pub}>
      <PubRanking pub={pub} rankings={rankings} />
      <Root theme={theme}>
        {drinks.map((drink) => {
          return <Result key={drink.productId} drink={drink} />;
        })}
      </Root>
    </PubContext.Provider>
  );
}

function PriceChart({
  data,
  display,
}: {
  data: { time: number; price: number }[];
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
      min: Math.floor(data.map((point) => point.price).sort((a, b) => a - b)[0]),
      tickAmount: 5,
      labels: {
        formatter: (p) => `£${p.toFixed(2)}`,
      }
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
        min: Math.floor(data.map((point) => point.price).sort((a, b) => a - b)[0]),
        tickAmount: 5,
        labels: {
          formatter: (p) => `£${p.toFixed(2)}`,
        }
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
          .map((point) => [point.time, point.price] as [number, number])
          .sort((a, b) => a[0] - b[0]),
      },
    ]);
  }, [data]);

  return (
    <div
      style={{
        display: display ? 'block' : 'none',
      }}
    >{display && <Chart options={options} series={series} type="area" />}

    </div>
  );
}
