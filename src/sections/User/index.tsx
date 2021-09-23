import React, {useState} from 'react';
import {RouteComponentProps} from 'react-router-dom';
import {useQuery} from '@apollo/react-hooks';
import { PageSkeleton, ErrorBanner } from '../../lib/components';
import {Col, Layout, Row} from 'antd';
import {USER} from '../../lib/graphql/queries';
import {Viewer} from '../../lib/types';
import { UserProfile, UserBookings, UserListings } from './components';
import {User as UserData, UserVariables} from '../../lib/graphql/queries/User/__generated__/User';

interface Props {
    viewer: Viewer;
}

interface MatchParams {
    id: string;
}

const {Content} = Layout;
const PAGE_LIMIT = 4;

export const User = ({viewer, match}: Props & RouteComponentProps<MatchParams>) => {
    const [listingsPage, setListingsPage] = useState(1);
    const [bookingsPage, setBookingsPage] = useState(1);

    const {data, loading, error} = useQuery<UserData, UserVariables>(USER, {
        variables: {
            id: match.params.id,
            bookingsPage,
            listingsPage,
            limit: PAGE_LIMIT
        }
    });

    if (loading) {
        return (
            <Content className="user">
                <PageSkeleton />
            </Content>
        );
    }

    if (error) {
        return (
            <Content className="user">
                <ErrorBanner description="This user may not exist or We've encountered an error. Please try again soon." />
                <PageSkeleton />
            </Content>
        );
    }

    const user = data ? data.user : null;
    const viewerIsUser  = viewer.id === match.params.id;

    const userListings = user ? user.listings : null;
    const userBookings = user ? user.bookings : null;

    const userProfileElement = user ? <UserProfile user={user} viewerIsUser={viewerIsUser} /> : null

    const userListingsElement = userListings ? (
        <UserListings 
            userListings={userListings}
            listingsPage={listingsPage}
            setListingsPage={setListingsPage}
            limit={PAGE_LIMIT}
        />
    ) : null;

    const userBookingsElement = userListings ? (
        <UserBookings 
            userBookings={userBookings}
            bookingsPage={bookingsPage}
            setBookingsPage={setBookingsPage}
            limit={PAGE_LIMIT}
        />
    ) : null;

    return (
        <Content className="user">
            <Row gutter={12}>
                <Col xs={24}>{userProfileElement}</Col>
            </Row>
            <Row gutter={12}>
                {userListingsElement}
                {userBookingsElement}
            </Row>
        </Content>
    );
}