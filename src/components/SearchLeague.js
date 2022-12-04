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

    async function CreateRosterObjects(points) {
        await fetch(`https://api.sleeper.app/v1/league/${leagueID}/rosters`)
        .then(response => response.json())
        .then(async rosterData => {
            for (var currRoster in rosterData) {
                await fetch(`https://api.sleeper.app/v1/user/${rosterData[currRoster].owner_id}`)
                .then(response => response.json())
                .then(userData => {
                    var user = {
                        user_name: userData.username,
                        user_points: points.map(function (item) {
                            return item[rosterData[currRoster].roster_id - 1]
                        }),
                        quarters: []
                    }
                    user.quarters = CaclculateQuarters(user.user_points)
                    setRoster(roster => [...roster, user])
                })
            }
        })
    }

    async function CalculatePerWeek() {
        var points = []
        var isCurrentWeek = true
        var sleeperData
        var week = 1

        while (week <= latestWeek) {
            await fetch(`https://api.sleeper.app/v1/league/${leagueID}/matchups/${week}`)
            .then(response => response.json())
            .then(data => {sleeperData = data})

            const weeklyPoints = sleeperData.map(function (roster) {
                return roster.points
            })
            const allEqualToZero = weeklyPoints.every(function (points) {
                return points === 0
            })
            if (!allEqualToZero) {
                points.push(weeklyPoints)
            }
            else {
                isCurrentWeek = false
            }
            ++week
        }
        console.log(points)
        CreateRosterObjects(points)
    }

    function CaclculateQuarters(user_points) {
        var quarters = []
        for (var i = 0; i < user_points.length; i += 4) {
            var currQuarter
            if ((i + 4) > user_points.length) {
                currQuarter = user_points.slice(i, user_points.length)
            }
            else {
                currQuarter = user_points.slice(i, i + 4)
            }
            const currQuarterSum = Math.round(currQuarter.reduce((a, b) => a + b, 0) * 100) / 100
            quarters.push(currQuarterSum)
        }
        console.log(quarters)
        return quarters
    }

    function renderSingleQuarter(quarterIndex) {
        return (
            roster
            .sort(function (a, b) {
                return b.quarters[quarterIndex]-a.quarters[quarterIndex]
            })
            .map((currRoster) => (
                <div>
                    {`${currRoster.user_name}: ${currRoster.quarters[quarterIndex]}`}
                </div>
            ))
        )
    }

    function renderAllQuarters() {
        //17 weeks of football
        const MAX_QUARTERS = 17 / 4
        return (    
            Array.from({length: MAX_QUARTERS})
                .map((_, index) => (
                    <div>
                        <header className='quarterlyHeader'>Quarter {index + 1}</header>
                        <div className='quarterlyTotals'>{renderSingleQuarter(index)}</div>
                    </div>

                ))
        )
    }

    function renderNothing() {
        return (
            <div>

            </div>
        )
    }


    return (
        <div className='searchLeague'>
            <header className='sleeperHeader'>
                <input type='text'
                placeholder={placeholder}
                value={leagueID}
                onChange={HandleLeagueID}
                className='leagueSearchBar'
                />
                <button onClick={ConnectToLeague}>
                    Search League
                </button>
            </header>
            <div>
                {leagueSubmitted ? renderAllQuarters() : renderNothing()}
            </div>
        </div>
    );
}