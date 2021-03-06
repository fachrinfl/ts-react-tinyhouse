import React, {useState} from "react";
import {useParams} from 'react-router-dom';
import {useQuery} from '@apollo/react-hooks';
import {Moment} from 'moment';
import { Layout, Col, Row } from 'antd';
import { PageSkeleton, ErrorBanner } from '../../lib/components'; 
import {LISTING} from '../../lib/graphql/queries';
import {
    Listing as ListingData,
    ListingVariables
} from '../../lib/graphql/queries/Listing/__generated__/Listing';
import {ListingCreateBooking, WrappedListingCreateBookingModal as ListingCreateBookingModal, ListingDetails, ListingBookings} from './components';
import { Viewer } from "../../lib/types";
import {useScrollToTop} from '../../lib/hooks';

interface MatchParams {
    id: string;
}

interface Props {
    viewer: Viewer
}

const {Content} = Layout;
const PAGE_LIMIT = 3;

export const Listing = ({viewer}: Props) => {
    const [bookingsPage, setBookingsPage] = useState(1);
    const [checkInDate, setCheckInDate] = useState<Moment | null>(null);
    const [checkOutDate, setCheckOutDate] = useState<Moment | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const {id} = useParams<MatchParams>();

    const {loading, data, error, refetch} = useQuery<ListingData, ListingVariables>(LISTING, {
        variables: {
            id,
            bookingsPage,
            limit: PAGE_LIMIT
        }
    });

    useScrollToTop();

    const clearBookingDate = () => {
        setModalVisible(false);
        setCheckInDate(null);
        setCheckOutDate(null);
    }

    const handleListingRefetch = async () => {
        await refetch();
    }

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
            viewer={viewer}
            host={listing.host}
            price={listing.price}
            bookingsIndex={listing.bookingsIndex}
            checkInDate={checkInDate}
            setCheckInDate={setCheckInDate}
            checkOutDate={checkOutDate}
            setCheckOutDate={setCheckOutDate}
            setModalVisible={setModalVisible}
        />
    ) : null;

    const listingCreateBookingModalElement = listing && checkInDate && checkOutDate ? (
        <ListingCreateBookingModal 
            id={listing.id}
            price={listing.price}
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            clearBookingDate={clearBookingDate}
            handleListingRefetch={handleListingRefetch}
        />
    ) : (null);

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
            {listingCreateBookingModalElement}
        </Content>
    );
}