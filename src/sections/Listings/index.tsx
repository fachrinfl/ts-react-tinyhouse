import React from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import {gql} from 'apollo-boost';
import {Alert, List, Avatar, Button, Spin} from 'antd';
import {ListingSkeleton} from './components';
import {Listings as ListingsData} from './__generated__/Listings';
import {
    DeleteListing as DeleteListingData, 
    DeleteListingVariables
} from './__generated__/DeleteListing';
import './styles/Listings.css';

const LISTINGS =  gql`
    query Listings {
        listings {
            id,
            title,
            image,
            address,
            price,
            numOfGuests,
            numOfBeds,
            numOfBaths,
            rating
        }
    }
`;

const DETELE_LISTING = gql`
    mutation DeleteListing($id: ID!) {
        deleteListing(id: $id) {
            id
        }
    }
`;

interface Props {
    title: string
};

export const Listings = ({title}: Props) => {
    const {data, refetch, loading, error} = useQuery<ListingsData>(LISTINGS);
    const [deleteListing, {
        loading: deleteListingLoading, 
        error: deleteListingError
    }] = useMutation<DeleteListingData, DeleteListingVariables>(DETELE_LISTING);

    const handleDeleteListing = async (id: string) => {
        await deleteListing({variables: {id}});
        refetch();
    }

    const listings = data ? data.listings : null;

    const listingsList = listings ? (
        <List 
            itemLayout="horizontal"
            dataSource={listings}
            renderItem={(listing) => (
                <List.Item actions={[
                    <Button type="primary" onClick={() => handleDeleteListing(listing.id)}>Delete</Button>
                ]}>
                    <List.Item.Meta 
                        avatar={<Avatar 
                            src={listing.image} 
                            shape='square'
                            size={48}
                        />}
                        title={listing.title} 
                        description={listing.address}
                    />
                </List.Item>
            )}
        />
    ) : null;

    if (loading) {
        return (<div className="listings">
            <ListingSkeleton title={title} />
        </div>);
    }

    if (error) {
        return (<div className="listings">
            <ListingSkeleton title={title} error />
        </div>);
    }

    const deleteListingErrorAlert = deleteListingError ? (
        <Alert 
            type="error"
            message="Uh oh! Something went wrong - please try again later :("
            className="listings__alert"
        />
    ) : null;
    
    return (
        <div className="listings">
            <Spin spinning={deleteListingLoading}>
                {deleteListingErrorAlert}
                <h2>{title}</h2>
                {listingsList} 
            </Spin>
        </div>
    );
};
