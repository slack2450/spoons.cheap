import { styled } from "@material-ui/core";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";

import Chart from 'react-apexcharts'

const PubContext = React.createContext();
const HistoricalPriceContext = React.createContext();

const Root = styled((props) => (
  <motion.div
    animate={{ opacity: [0, 1] }}
    transition={{ delay: 0.5 }}
    {...props}
  />
))((props) => ({
  opacity: 0,
  width: "100%",
  display: "grid",
  gap: "15px",
  gridAutoRows: "max-content",
  gridTemplateColumns: "1fr 1fr 1fr",
  [props.theme.breakpoints.down("md")]: {
    gridTemplateColumns: "1fr 1fr",
  },
  [props.theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "1fr",
  },
  marginBottom: "24px",
}));

function Result({ drink }) {

  const { venueId } = React.useContext(PubContext);

  const { historicalData } = React.useContext(HistoricalPriceContext);

  const [priceData, setPriceData] = useState([]);
  const [fetchedPriceData, setFetchedPriceData] = useState(false);
  const [detailedInfo, setDetailedInfo] = useState(false);

  async function click() {
    setDetailedInfo(!detailedInfo);
    if (!fetchedPriceData && venueId) {
      setFetchedPriceData(true);
      const historicalPricing = historicalData.map((drinksOnDate) => {
        const mapDrink = drinksOnDate.drinks.find(d => d.productId === drink.productId);
        return {
          timestamp: drinksOnDate.date,
          price: mapDrink ? mapDrink.price : 0
        }
      });

      const filteredData = historicalPricing.filter(d => d.price !== 0 && typeof d.price !== 'undefined');
      setPriceData(filteredData);
    }
  }

  useEffect(() => {
    setPriceData([]);
    setFetchedPriceData(false);
    setDetailedInfo(false);
  }, [venueId]);

  return (
    <motion.div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#dcdcdc",
        borderRadius: "5px",
        display: "grid",
        placeItems: "center",
        padding: "10px",
        boxShadow: "5px 5px 5px rgba(0,0,0,0.4)",
        cursor: "pointer",
      }}
      whileHover={{
        translateX: "-5px",
        translateY: "-5px",
        boxShadow: "10px 10px 15px rgba(0,0,0,0.4)",
        transition: { duration: 0.2 },
      }}
      onClick={click}
    >
      <p
        style={{
          textAlign: "center",
          fontWeight: "bold",
          margin: 0,
        }}
      >
        {drink.displayName}
      </p>
      <p
        style={{
          textAlign: "center",
          margin: 0,
          display: detailedInfo ? "block" : "none",
        }}
      >
        {drink.description}
      </p>
      <p
        style={{
          textAlign: "center",
          margin: 0,
        }}
      >
        {`£${drink.ppu.toFixed(3)} per unit`}
      </p>
      <p
        style={{
          textAlign: "center",
          margin: 0,
          display: detailedInfo ? "block" : "none",
        }}
      >
        {drink.displayPrice}
      </p>
      <p
        style={{
          textAlign: "center",
          margin: 0,
          display: detailedInfo ? "block" : "none",
        }}
      >
        {`${drink.units} units`}
      </p>
      <PriceChart data={priceData} display={detailedInfo} />
    </motion.div>
  );
}

function PubRanking({ pub, rankings }) {
  if (!pub)
    return <></>;

  let mostRecentRankingDate = 0;
  let mostRecentRanking = { pubs: []};
  for(const ranking of rankings) {
    if(ranking.date > mostRecentRankingDate) {
      mostRecentRankingDate = ranking.date;
      mostRecentRanking = ranking;
    }
  }

  const mostRecentRank = mostRecentRanking.pubs.find(p => p.venueId === pub.venueId)?.rank;
  const highestRank = Math.max(...mostRecentRanking.pubs.map(p => p.rank));

  const options = {
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
      enabled: false
    },
    stroke: {
      curve: 'smooth'
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
        formatter: (p) => `${p}`
      }
    }
  }

  const series = [{
    name: 'Ranking',
    data: rankings.map((ranking) => [ranking.date, ranking.pubs.find(p=> p.venueId === pub.venueId)?.rank]).filter(point=> typeof point[1] !== 'undefined').sort((a, b) => a[0] - b[0])
  }]

  console.log('Ranking series');
  console.log(series);

  return (
      <motion.div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#dcdcdc",
          borderRadius: "5px",
          display: "grid",
          placeItems: "center",
          padding: "10px",
          boxShadow: "5px 5px 5px rgba(0,0,0,0.4)",
          cursor: "pointer",
        }}
        whileHover={{
          translateX: "-5px",
          translateY: "-5px",
          boxShadow: "10px 10px 15px rgba(0,0,0,0.4)",
          transition: { duration: 0.2 },
        }}
      //onClick={click}
      >
        <p
          style={{
            textAlign: "center",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          {pub.name}
        </p>
        <p
        style={{
          textAlign: "center",
          margin: 0,
        }}
      >
        {`${mostRecentRank}/${highestRank} in the UK on ${(new Date(mostRecentRanking.date)).toDateString()}`}
      </p>
      <div style={{
        display: "block"
      }}>
        <Chart options={options} series={series} type="area" />
      </div>
      </motion.div>)
}

export default function SearchResults({ drinks: historicalDrinks, pub, rankings }) {

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
      <HistoricalPriceContext.Provider value={{ historicalData: historicalDrinks }}>
        <PubRanking pub={pub} rankings={rankings} />
        <Root>
          {todaysDrinks.drinks.map((drink) => {
            return <Result key={drink.productId} drink={drink} />;
          })}
        </Root>
      </HistoricalPriceContext.Provider>
    </PubContext.Provider>
  );
}

function PriceChart({ data, display }) {

  const [options, setOptions] = useState({
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
      enabled: false
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
        formatter: (p) => `£${p.toFixed(2)}`
      }
    }
  });

  const [series, setSeries] = useState([{
    name: 'Price',
    data: [],
  }]);

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
        enabled: false
      },
      stroke: {
        curve: 'smooth'
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
          formatter: (p) => `£${p.toFixed(2)}`
        }
      }
    });

    setSeries([{
      name: 'Price',
      data: data.map((point) => [point.timestamp, point.price]).sort((a, b) => a[0] - b[0])
    }]);

  }, [data]);

  //console.log(Math.floor(data.map((point) => point.price).sort()[0]));

  return <div style={{
    display: display ? "block" : "none",
  }}>
    <Chart options={options} series={series} type="area" />
  </div>
}