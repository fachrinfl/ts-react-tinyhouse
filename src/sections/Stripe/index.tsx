import React, {useEffect, useRef} from 'react';
import {Redirect, useHistory} from 'react-router-dom';
import {useMutation} from '@apollo/react-hooks';
import {Layout, Spin} from 'antd';
import {CONNECT_STRIPE} from '../../lib/graphql/mutations';
import {
    ConnectStripe as ConnectStripeData,
    ConnectStripeVariables
} from '../../lib/graphql/mutations/ConnectStripe/__generated__/ConnectStripe';
import {Viewer} from '../../lib/types';
import { displaySuccessNotification } from '../../lib/utils';
import {useScrollToTop} from '../../lib/hooks';

interface Props {
    viewer: Viewer,
    setViewer: (viewer: Viewer) => void;
}

const { Content } = Layout;

export const Stripe = ({viewer, setViewer}: Props) => {
    const [connectStripe, {
        data, loading, error
    }] = useMutation<ConnectStripeData, ConnectStripeVariables>(CONNECT_STRIPE, {
        onCompleted: data => {
            if (data && data.connectStripe) {
                setViewer({...viewer, hasWallet: data.connectStripe.hasWallet})
                displaySuccessNotification(
                    "You'ev successfully connected your Stripe Account!",
                    "You can now begin to create listings in the Host page."
                );
            }
        }
    });
    const connectStringRef = useRef(connectStripe);

    const history = useHistory();

    useScrollToTop();

    useEffect(() => {
        const code = new URL(window.location.href).searchParams.get("code");

        if (code) {
            connectStringRef.current({
                variables: {
                    input: { code }
                }
            });
        } else {
            history.replace("/login");
        }
        
    }, [history]);

    if (data && data.connectStripe) {
        return <Redirect to={`/user/${viewer.id}`} />
    }

    if (loading) {
        return (
            <Content className="stripe">
                <Spin size="large" tip="connection your Stripe account..." />
            </Content>
        );
    }

    if (error) {
        return <Redirect to={`/user/${viewer.id}?stripe_error=true`} />;
    }

    return null;
}