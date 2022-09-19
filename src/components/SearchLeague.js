import React, { useState } from 'react';


export default function SearchLeague ({ placeholder }) {
    const [leagueID, setLeagueID] = useState("")

    const HandleLeagueID = (event) => {
        const input = event.target.value
        if (input != leagueID) {
            setLeagueID(input)
            console.log(leagueID);
        }
    }
    
    function ConnectToLeague() {
        fetch(`https://api.sleeper.app/v1/league/${leagueID}/rosters`).then((response) => {
            if (response.ok) {
                console.log(response.json())
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