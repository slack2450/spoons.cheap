import { styled } from "@material-ui/core";
import { motion } from "framer-motion";
import React, { useState } from "react";

import axios from "axios";

import Chart from 'react-apexcharts'

const PubContext = React.createContext();

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

  const [priceData, setPriceData] = useState([]);
  const [fetchedPriceData, setFetchedPriceData] = useState(false);
  const [detailedInfo, setDetailedInfo] = useState(false);

  async function click() {
    setDetailedInfo(!detailedInfo);
    if (!fetchedPriceData && venueId) {
      const response = await axios.get(`https://api.spoons.cheap/price/${venueId}/${drink.eposName}`);
      setFetchedPriceData(true);
      response.data.push({price: drink.priceValue, timestamp: Date.now()})
      setPriceData(response.data);
    }
  }

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
      <PriceChart data={priceData} display={detailedInfo}/>

    </motion.div>
  );
}

export default function SearchResults({ drinks, pub }) {

  return (
    <PubContext.Provider value={pub ? pub : { venueId: 'none'}}>
      <Root>
        {drinks.map((drink) => {
          return <Result key={drink.eposName} drink={drink} />;
        })}
      </Root>
    </PubContext.Provider>
  );
}

function PriceChart({ data, display }) {

  const state = {
    options: {
      chart: {
        type: 'area',
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      dataLabels : {
        enabled: false
      },
      stroke: {
        curve: 'straight'
      },
      xaxis: {
        type: 'datetime',
      },
      tooltip: {
        y: {
          formatter: (p) => `£${p.toFixed(2)}`
        }
      }
    },
    series: [{
      name: 'Price',
      data: data.map((point) => [point.timestamp, point.price])
    }]
  }

  return <div style={{
    display: display ? "block" : "none",
  }}>
    <Chart options={state.options} series={state.series} type="area"/>
  </div>
}