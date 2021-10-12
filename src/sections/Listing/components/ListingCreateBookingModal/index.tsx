import React from 'react';
import { Modal, Button, Divider, Icon, Typography } from 'antd';
import moment, { Moment } from 'moment';
import { formatListingPrice } from '../../../../lib/utils';

interface Props {
    price: number;
    modalVisible: boolean;
    checkInDate: Moment;
    checkOutDate: Moment;
    setModalVisible: (modalVisible: boolean) => void;
}

const { Paragraph, Text, Title } = Typography;

export const ListingCreateBookingModal = ({ 
    price,
    modalVisible, 
    setModalVisible,
    checkInDate,
    checkOutDate
}: Props) => {

    const daysBooked = checkOutDate.diff(checkInDate, "days") + 1;
    const listingPrice = price * daysBooked;
    const totalPrice = listingPrice;

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
                            Total = <Text strong>{formatListingPrice(listingPrice, false)}</Text>
                        </Paragraph>
                        <Divider />
                        <div className="listing-booking-modal__stripe-card-section">
                            <Button size="large" type="primary" className="listing-booking-modal__cta">
                                Book
                            </Button>
                        </div>
                    </div>
                </div>
        </Modal>
    );
}