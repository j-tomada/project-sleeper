import React, { useState, useEffect } from 'react';
import './SearchLeague.css'

export default function SearchLeague ({ placeholder }) {
    const [leagueID, setLeagueID] = useState("")
    const [latestWeek, setLatestWeek] = useState(0)
    const [leagueSubmitted, setLeagueSubmitted] = useState(false)
    const [roster, setRoster] = useState([])

    useEffect(() => {
        fetch('https://api.sleeper.app/v1/state/nfl')
        .then(response => response.json())
        .then(data => {
            setLatestWeek(data.week - 1)
            console.log(latestWeek)
        })
    }, [])

    const HandleLeagueID = (event) => {
        const input = event.target.value
        if (input !== leagueID) {
            setLeagueID(input)
            console.log(leagueID);
        }
    }
    
    async function ConnectToLeague() {
        if (roster.length > 0) {
            setRoster([])
        }
        await fetch(`https://api.sleeper.app/v1/league/${leagueID}/rosters`).then((response) => {
            if (response.ok) {
                console.log(response.json())
                CalculatePerWeek()
                setLeagueSubmitted(true)
                console.log(roster)
                console.log(latestWeek)
            }
            else {
                throw 'Error getting league'
            }
        })
    }


    return (
        <div className='searchLeague'>
            <input type='text'
            placeholder={placeholder}
            value={leagueID}
            onChange={HandleLeagueID}
            className='leagueSearchBar'
            />
            <button onClick={ConnectToLeague}>
                Search League
            </button>

        </div>
    );
}