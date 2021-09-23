import React, {useState} from "react";
import {RouteComponentProps} from 'react-router-dom';
import {useQuery} from '@apollo/react-hooks';
import {Moment} from 'moment';
import { Layout, Col, Row } from 'antd';
import { PageSkeleton, ErrorBanner } from '../../lib/components'; 
import {LISTING} from '../../lib/graphql/queries';
import {
    Listing as ListingData,
    ListingVariables
} from '../../lib/graphql/queries/Listing/__generated__/Listing';
import {ListingCreateBooking, ListingDetails, ListingBookings} from './components';

interface MatchParams {
    id: string;
}

const {Content} = Layout;
const PAGE_LIMIT = 3;

export const Listing = ({match}: RouteComponentProps<MatchParams>) => {
    const [bookingsPage, setBookingsPage] = useState(1);
    const [checkInDate, setCheckInDate] = useState<Moment | null>(null);
    const [checkOutDate, setCheckOutDate] = useState<Moment | null>(null);

    const {loading, data, error} = useQuery<ListingData, ListingVariables>(LISTING, {
        variables: {
            id: match.params.id,
            bookingsPage,
            limit: PAGE_LIMIT
        }
    });

    if (loading) {
        return (
            <Content className="listing">
                <PageSkeleton />
            </Content>
        );
    }

    if (error) {
        return (
            <Content className="listing">
                <ErrorBanner description="This listing may not exist or we/ve encountered an error. Please try again soon!"/>
                <PageSkeleton />
            </Content>
        );
    }

    const listing = data ? data.listing : null;

    const listingBookings = listing ? listing.bookings : null;

    const listingDetailsElement = listing ? <ListingDetails listing={listing} /> : null;

    const listingBookingsElement = listingBookings 
    ? (
        <ListingBookings 
        listingBookings={listingBookings} 
        bookingsPage={bookingsPage} 
        setBookingsPage={setBookingsPage} 
        limit={PAGE_LIMIT}/>
    )
    : null;

    const listingCreateBookingElement = listing ? (
        <ListingCreateBooking 
            price={listing.price}
            checkInDate={checkInDate}
            setCheckInDate={setCheckInDate}
            checkOutDate={checkOutDate}
            setCheckOutDate={setCheckOutDate}
        />
    ) : null;

    return (
        <Content className="listing">
        <Row gutter={24} type="flex" justify="space-between">
            <Col xs={24} lg={14}>
            {listingDetailsElement}
            {listingBookingsElement}
            </Col>
            <Col xs={24} lg={10}>
            {listingCreateBookingElement}
            </Col>
        </Row>
        </Content>
    );
}