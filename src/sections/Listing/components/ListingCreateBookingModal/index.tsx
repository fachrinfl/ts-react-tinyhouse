import React from 'react';
import {CardElement, injectStripe, ReactStripeElements} from 'react-stripe-elements';
import { Modal, Button, Divider, Icon, Typography } from 'antd';
import { CREATE_BOOKING } from '../../../../lib/graphql/mutations';
import { CreateBooking as CreateBookingData, CreateBookingVariables } from '../../../../lib/graphql/mutations/CreateBooking/__generated__/CreateBooking';
import moment, { Moment } from 'moment';
import { formatListingPrice, displaySuccessNotification, displayErrorMessage } from '../../../../lib/utils';
import { useMutation } from '@apollo/react-hooks';

interface Props {
    id: string;
    price: number;
    modalVisible: boolean;
    checkInDate: Moment;
    checkOutDate: Moment;
    setModalVisible: (modalVisible: boolean) => void;
    clearBookingDate: () => void;
    handleListingRefetch: () => Promise<void>;
}

const { Paragraph, Text, Title } = Typography;

export const ListingCreateBookingModal = ({ 
    id,
    price,
    modalVisible, 
    setModalVisible,
    checkInDate,
    checkOutDate,
    stripe,
    clearBookingDate,
    handleListingRefetch
}: Props & ReactStripeElements.InjectedStripeProps) => {

    const [createBooking, { loading }] = useMutation<CreateBookingData, CreateBookingVariables>(CREATE_BOOKING, {
        onCompleted: () => {
            clearBookingDate();
            displaySuccessNotification("You've successfully booked the listing!",
            "Booking history can always be found in your User page.");
            handleListingRefetch();
        },
        onError: () => {
            displayErrorMessage("Sorry! We weren't able to successfully book the listing. Please try again later!");
        }
    });

    const daysBooked = checkOutDate.diff(checkInDate, "days") + 1;
    const listingPrice = price * daysBooked;
    const totalPrice = listingPrice;
    
    const handleCreateBooking = async () => {
        if (!stripe) {
            return displayErrorMessage("Sorry! We weren't able to connect with Stripe.");
        }

        let {token: stripeToken, error} = await stripe.createToken();
        if (stripeToken) {
            createBooking({
                variables: {
                        input: {
                            id,
                            source: stripeToken.id,
                            checkIn: moment(checkInDate).format("YYYY-MM-DD"),
                            checkOut: moment(checkOutDate).format("YYYY-MM-DD")
                        }
                }
            });
        } else {
            displayErrorMessage(error && error.message ? error.message : "Sorry! We weren't able to book the listing. Please try again later.");
        }
         
    }
    return (
        <Modal
            visible={modalVisible}
            centered
            footer={null}
            onCancel={() => setModalVisible(false)}>
                <div className="listing-booking-modal">
                    <div className="listing-booing-modal__intro">
                        <Title className="listing-booking-modal__intro-title">
                            <Icon type="key"></Icon>
                        </Title>
                        <Title level={3} className="listing-booking-modal__intro-title">
                            Book your trip
                        </Title>
                        <Paragraph>
                            Enter your payment information to book the listing from the dates between 
                            {" "}<Text mark strong>{moment(checkInDate).format("MMMM Do YYYY")}</Text>{" "}and{" "}
                            <Text mark strong>{moment(checkOutDate).format("MMMM Do YYYY")}</Text>
                            , inclusive.
                        </Paragraph>
                    </div>
                    <Divider />
                    <div className="listing-booking-modal__charge-summary">
                        <Paragraph>
                            {formatListingPrice(price, false)} * {daysBooked} day ={" "}
                            <Text strong>{formatListingPrice(listingPrice, false)}</Text>
                        </Paragraph>
                        <Paragraph className="listing-booking-modal__charge-summary-total">
                            Total = <Text strong>{formatListingPrice(totalPrice, false)}</Text>
                        </Paragraph>
                        <Divider />
                        <div className="listing-booking-modal__stripe-card-section">
                            <CardElement hidePostalCode className="listing-booking-modal__stripe-card"/>
                            <Button 
                                size="large" 
                                type="primary" 
                                className="listing-booking-modal__cta"
                                onClick={handleCreateBooking}
                                loading={loading}>
                                Book
                            </Button>
                        </div>
                    </div>
                </div> 
        </Modal>
    );
}

export const WrappedListingCreateBookingModal = injectStripe(ListingCreateBookingModal);