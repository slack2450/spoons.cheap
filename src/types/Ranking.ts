interface PubRank {
    venueId: number
    mahld: number;
    rank: number;
    beerAvgPPU: number;
    wineAvgPPU: number;
    spiritAvgPPU: number;
}

export interface Ranking {
    date: number;
    pubs: PubRank[];
}