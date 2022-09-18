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

async function getTodaysDrinks(pub) {
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
      });

      return drinks
}

function App() {
  const [pubs, setPubs] = useState([]);
  const [rankings, setRankings] = useState([]);

  const [pub, setPub] = useState(null);

  const [drinks, setDrinks] = useState([]);

  useEffect(() => {

    setDrinks([]);

    if (!pub) return;
    (async function () {
      const todaysDrinks = await getTodaysDrinks(pub);
      const todaysDate = Date.now();

      console.log('Fetched todays drinks')
      console.log(todaysDrinks);

      setDrinks(drinks => {
        drinks.push({
          date: todaysDate,
          drinks: todaysDrinks,
        });
        return [...drinks];
      });
    })();

    (async () => {
      const res = await axios.get(`https://api.spoons.cheap/v1/price/${pub.venueId}`);
      console.log(res.data)

      console.log(`Fetched historical`);
      console.log(res.data);

      for(const date of res.data) {
        for(const drink of date.drinks) {
          drink.ppu = drink.price / drink.units;
        }
      }

      setDrinks(drinks => {
        drinks.push(...res.data);
        return [...drinks];
      });
    })();
  }, [pub]);

  useEffect(()=> {
    console.log('Drinks updated to:')
    console.log(typeof drinks);
    console.log(drinks);
  }, [drinks]);

  useEffect(() => {
    (async function () {
      const res = await axios.get("/v1/venues/en_gb/venues.json");
      for(let i = 0; i < res.data.venues.length; i++) {
        const venue = res.data.venues[i];
        if(venue.pubIsClosed || venue.pubIsTempClosed) {
          res.data.venues.splice(venue, 1);
          i--;
          console.log(`${venue.name} is closed ☹ Removing from list`)
        }
      }
      console.log(`Found ${res.data.venues.length} open Wetherspoons!`)
      setPubs(res.data.venues);
    })();

    (async function() {
      const res = await axios.get('https://api.spoons.cheap/v1/rankings');
      setRankings(res.data);
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
        ></Search>
        <SearchResults
          drinks={drinks} pub={pub} rankings={rankings}
        />
      </SearchContainer>
    </Root>
  );
}

export default App;
