interface BookingsIndexMonth {
    [key: string]: boolean;
}

interface BookingsIndexYear {
    [key: string]: BookingsIndexYear
}

export interface BookingsIndex {
    [key: string]: BookingsIndex;
}