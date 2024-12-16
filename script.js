console.log("Pokémon Browser Game Loaded");

const API_BASE_URL = 'https://pokeapi.co/api/v2/pokemon';
const TOTAL_GUESSES = 10;

async function fetchRandomPokemon() {
    const response = await fetch(`${API_BASE_URL}?limit=1000`);
    const data = await response.json();
    const randomIndex = Math.floor(Math.random() * data.results.length);
    const pokemonResponse = await fetch(data.results[randomIndex].url);
    return await pokemonResponse.json();
}

class PokemonGame {
    constructor() {
        this.currentPokemon = null;
        this.totalGuesses = 0;
        this.results = [];
        this.pokemonDisplay = document.querySelector('.pokemon-display');
        this.optionsContainer = document.getElementById('pokemon-options');
        this.submitButton = document.getElementById("submit-guess");
        
        this.submitButton.addEventListener("click", this.handleSubmit.bind(this));
    }

    async displayPokemon(pokemon) {
        this.currentPokemon = pokemon;
        this.pokemonDisplay.innerHTML = `
            <h2>Choose the correct Pokémon name!</h2>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
        `;
        this.optionsContainer.innerHTML = '';

        const options = [
            this.createOption(pokemon.name),
            this.createOption((await fetchRandomPokemon()).name),
            this.createOption((await fetchRandomPokemon()).name)
        ];

        options
            .sort(() => Math.random() - 0.5)
            .forEach(option => {
                this.optionsContainer.appendChild(option.input);
                this.optionsContainer.appendChild(option.label);
            });
    }

    createOption(name) {
        const input = document.createElement('input');
        const label = document.createElement('label');
        input.type = 'radio';
        input.name = 'pokemon';
        input.value = name;
        input.id = `pokemon-${name}`;
        label.htmlFor = `pokemon-${name}`;
        label.innerText = name;
        return { input, label };
    }

    handleGuess() {
        const selectedOption = document.querySelector('input[name="pokemon"]:checked');
        
        if (!selectedOption) {
            this.pokemonDisplay.innerHTML += `<h2>Please select a Pokémon name!</h2>`;
            return;
        }

        const inputName = selectedOption.value;
        const isCorrect = inputName.toLowerCase() === this.currentPokemon.name.toLowerCase();
        
        this.results.push({ name: this.currentPokemon.name, correct: isCorrect });
        this.totalGuesses++;

        this.pokemonDisplay.innerHTML = `
            <h2>Guess the Pokémon name!</h2>
            <img src="${this.currentPokemon.sprites.front_default}" alt="${this.currentPokemon.name}" />
            <h2>${isCorrect ? `Yes, correct! The Pokémon is ${this.currentPokemon.name}.` : 'Wrong Pokémon, try again!'}</h2>
        `;

        this.optionsContainer.innerHTML = "";

        if (this.totalGuesses < TOTAL_GUESSES) {
            fetchRandomPokemon().then(pokemon => this.displayPokemon(pokemon));
        } else {
            this.displayResults();
        }
    }

    handleSubmit(event) {
        event.preventDefault();
        if (this.totalGuesses < TOTAL_GUESSES) {
            this.handleGuess();
        } else {
            this.resetGame();
        }
    }

    resetGame() {
        console.log("Game is resetting...");
        this.totalGuesses = 0;
        this.results = [];
        this.submitButton.innerText = "Submit Guess";
        fetchRandomPokemon().then(pokemon => this.displayPokemon(pokemon));
    }

    displayResults() {
        const score = this.results.filter(result => result.correct).length;
        let resultsHTML = `
        <div class="results-container">
            <h2>Game Over! Your score: ${score} out of ${TOTAL_GUESSES}</h2>
            <table id="result-table">
                <tr><th>Pokémon Name</th><th>Result</th></tr>
                ${this.results.map(result => `<tr><td>${result.name}</td><td id="${result.correct ? 'correct' : 'wrong'}">${result.correct ? '✓' : '✗' }</td></tr>`).join('')}
            </table>
        </div>`;
        
        this.pokemonDisplay.innerHTML = resultsHTML;
        this.submitButton.innerText = "Play Again";
    }
}

const game = new PokemonGame();
fetchRandomPokemon().then(pokemon => game.displayPokemon(pokemon));
