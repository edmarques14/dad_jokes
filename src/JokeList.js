import React, { Component } from 'react'
import axios from 'axios';
import Joke from './Joke';
import "./JokeList.css";
import { v4 as uuidv4 } from 'uuid';

const URL = "https://icanhazdadjoke.com/";

class JokeList extends Component {
    static defaultProps = {
        numJokesToGet: 10
    };
    constructor(props) {
        super(props);
        this.state = {
            jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
            isLoading: false
        };
        this.seenJokes = new Set(this.state.jokes.map(j => j.text))
        this.handleClick = this.handleClick.bind(this);
    }
    componentDidMount() {
        if (this.state.jokes.length === 0) this.getJokes();
    }
    async getJokes() {
        try {
            let jokesArr = [];
            while (jokesArr.length < this.props.numJokesToGet) {
                let res = await axios.get(URL, {
                    headers: { Accept: "application/json" }
                });
                let newJoke = res.data.joke;
                if (!this.seenJokes.has(newJoke)) {
                    jokesArr.push({ id: uuidv4(), joke: res.data.joke, votes: 0 })
                } else {
                    console.log("FOUND A DUPLICATE")
                }
            }

            this.setState(st => ({
                isLoading: false,
                jokes: [...st.jokes, ...jokesArr]
            }),
                //it will convert jokes to string and store them 
                // in local storage
                () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
            )
        } catch (e) {
            alert(e)
            this.setState({ isLoading: false })
        }

    }
    handleVote(id, delta) {
        this.setState(st => ({
            jokes: st.jokes.map(j =>
                j.id === id ? { ...j, votes: j.votes + delta } : j
            )
        }),
            () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
        )
    }
    handleClick() {
        this.setState({ isLoading: true }, this.getJokes)
        this.getJokes()
    }
    render() {
        let jokesList = this.state.jokes.sort((a, b) => b.votes - a.votes);

        if (this.state.isLoading) {
            return (
                <div className="JokeList-spinner">
                    <i className="far fa-8x fa-laugh fa-spin" />
                    <h1 className="JokeLisst-title">Loading...</h1>
                </div>
            )
        }
        return (
            <div className="JokeList">
                <div className="JokeList-sidebar">
                    <h1 className="JokeList-title">
                        <span>Dad</span> Jokes
                    </h1>
                    <img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg" alt="emoji" />
                    <button onClick={this.handleClick} className="JokeList-getmore">Fetch Jokes</button>
                </div>
                <div className="JokeList-jokes">
                    {
                        jokesList.map(j => (
                            <Joke
                                joke={j.joke}
                                votes={j.votes}
                                key={j.id}
                                upVote={() => this.handleVote(j.id, 1)}
                                downVote={() => this.handleVote(j.id, -1)}
                            />
                        ))
                    }
                </div>
            </div>
        )
    }
}
export default JokeList;