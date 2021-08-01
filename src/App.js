import { Container, Typography, TextField, styled } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { useEffect, useState } from "react";

import SearchResults from './SearchResults';

import axios from "axios";

const Root = styled(Container)({
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
});

const SearchContainer = styled(Container)({
  display: "grid",
  placeItems: "center",
  gridGap: "14px",
});

const Search = styled((props) => (
  <Autocomplete
    value={props.value}
    onChange={props.onChange}
    fullWidth
    options={props.options}
    getOptionLabel={(option) => `${option.name}, ${option.town}`}
    renderInput={(params) => (
      <TextField
        {...params}
        {...props}
        placeholder="Search Pubs"
        variant="outlined"
      />
    )}
  />
))({
  borderRadius: "30px",
  backgroundColor: "#dcdcdc",
  boxShadow: "5px 5px 8px rgba(0,0,0,0.3)",
  paddingLeft: "15px",
});

function App() {
  const [pubs, setPubs] = useState([]);

  const [pub, setPub] = useState(null);

  const [drinks, setDrinks] = useState([]);

  useEffect(() => {
    if (!pub) return;
    (async function () {
      const res = await axios.get(`/content/v3/menus/${pub.venueId}.json`);

      let drinksMenu;
      for (const menu of res.data.menus) {
        if (menu.name === "Drinks") {
          drinksMenu = menu;
          break;
        }
      }

      const drinks = [];

      for (const drinkCategory of drinksMenu.subMenu) {
        for (const productGroup of drinkCategory.productGroups) {
          for (const product of productGroup.products) {

            const regex = /ABV, (...) unit/
            const matches = product.description.match(regex);

            if(matches && matches.length > 0) {

              let shouldContinue = false;
              for(const existing of drinks) {
                if(existing.displayName === product.displayName)
                  shouldContinue = true;
              }

              if(shouldContinue)
                continue;

              product.units = parseFloat(matches[1]);
              product.ppu = product.priceValue / product.units
              drinks.push(product);
            }
            
          }
        }
      }

      drinks.sort((a, b) => {
        return a.ppu - b.ppu;
      })

      console.log(drinks);

      setDrinks(drinks);
    })();
  }, [pub]);

  useEffect(() => {
    (async function () {
      const res = await axios.get("/v1/venues/en_gb/venues.json");
      setPubs(res.data.venues);
    })();
  }, []);

  return (
    <Root>
      <SearchContainer>
        <Typography
          style={{
            fontFamily: "Pacifico",
            color: "#dcdcdc",
            filter: "drop-shadow(5px 5px 8px rgba(0, 0, 0, 0.8))",
            fontSize: "10vw",
          }}
        >
          Spoons.cheap
        </Typography>
        <Search
          options={pubs}
          onChange={(event, value) => {
            setPub(value);
          }}
          value={pub}
        ></Search>
        <SearchResults
          drinks={drinks}
        />
      </SearchContainer>
    </Root>
  );
}

export default App;
