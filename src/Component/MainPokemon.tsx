import axios from "axios";
import { useEffect, useState } from "react";
import Heart from "react-animated-heart";

interface Pokemons {
  id: number;
  name: string;
  types: string[];
  baseStats:any;
}
interface Type {
  slot: number;
  type: {
    name: string;
  };
}

interface Stat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
  };
}



export const MainPokemon = () => {
  const [pokemonList, setPokemonList] = useState<Pokemons[]>([]);
  const [offset, setOffset] = useState(0);
  const [isClick, setClick] = useState<{ [key: string]: boolean }>(() => {
    const storedClickState = localStorage.getItem("pokemonClickState");
    return storedClickState ? JSON.parse(storedClickState) : {};
  });

  const [selectedPokemon, setSelectedPokemon] = useState<Pokemons | null>(null);


  useEffect(() => {
    fetchPokemonList();
  }, [offset]);

  const fetchPokemonList = () => {
    axios
      .get(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`)
      .then((response) => {
        const updatedPokemonList = response.data.results.map(
          (pokemon: any, index: number) => ({
            ...pokemon,
            id: index + 1 + offset,
          }))
        setPokemonList(updatedPokemonList);
      })
      .catch((error) => {
        console.log("There was an error", error);
      });
  };

  const handleNext = () => {
    setOffset(offset + 20);
  };

  const handlePrev = () => {
    if (offset >= 20) {
      setOffset(offset - 20);
    }
  };

  const handleHeartClick = (name: string) => {
    setClick((prevClick) => {
      const newClickState = {
        ...prevClick,
        [name]: !prevClick[name],
      };

      localStorage.setItem("pokemonClickState", JSON.stringify(newClickState));

      return newClickState;
    });
  };

  const handlePokemonClick = async (pokemon: Pokemons) => {
    try {
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${pokemon.id}`
      );
      const { types, stats } = response.data;

      const clickedPokemonDetails = {
        id: pokemon.id,
        name: pokemon.name,
        types: types.map((type: Type) => type.type.name),
        baseStats: stats.map((stat: Stat) => ({
          name: stat.stat.name,
          value: stat.base_stat,
        })),
      };
 
      setSelectedPokemon(clickedPokemonDetails);

    } catch (error) {
      console.error("Error fetching Pokemon details:", error);
    }
  };

  return (
    <>
    <div className="Title" id="title">
      Pokedex
    </div>
      <div className="container">
        <div className="leftContainer">
          <div className="card-container">
            {pokemonList.map((pokemon) => (
              <div
                className="card"
                key={pokemon.id}
                onClick={() => handlePokemonClick(pokemon)}
              >
                <h3>{pokemon.id}</h3>
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                  alt={pokemon.name}
                />
                <h4>{pokemon.name}</h4>
                <Heart
                  isClick={isClick[pokemon.name]}
                  onClick={() => handleHeartClick(pokemon.name)}
                />
              </div>
            ))}
          </div>
          <div className="btn-group">
            <a href="#title">
              <button onClick={handlePrev} disabled={offset === 0}>
                Previous
              </button>
            </a>
            <a href="#title">
              <button onClick={handleNext}>Next</button>
            </a>
          </div>
        </div>
        <div className="rightContainer">
          {selectedPokemon ? (
            <>
              <h1>{selectedPokemon.name}</h1>
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selectedPokemon.id}.png`}
                alt=""
              />
              <div className="type">
                {selectedPokemon.types.map((type: string, index: number) => (
                  <div key={index} className={`group${index + 1}`}>
                    <h2>{type}</h2>
                  </div>
                ))}
              </div>
              <div className="base-stat">
                {selectedPokemon.baseStats.map((stat:any, index:any) => (
                  <h3 key={index}>{`${stat.name}:${stat.value}`}</h3>
                ))}
              </div>
            </>
          ) : (
            <p>Please click on a Pokémon to view details</p>
          )}
        </div>
      </div>
    </>
  );
};
