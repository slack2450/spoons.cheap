import { styled } from "@material-ui/core";
import { motion } from "framer-motion";
import React, { useState } from "react";

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

function Result({ drink, onClick }) {


  const [detailedInfo, setDetailedInfo] = useState(false);

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
      onClick={() => setDetailedInfo(!detailedInfo)}
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
    </motion.div>
  );
}

export default function SearchResults({ drinks }) {
  return (
    <Root>
      {drinks.map((drink) => {
        return <Result drink={drink} />;
      })}
    </Root>
  );
}
