import React from 'react';
import { Avatar, Button, Icon, Menu } from "antd";
import { Link } from 'react-router-dom';
import { Viewer } from '../../../../lib/types';
import { displaySuccessNotification, displayErrorMessage } from '../../../../lib/utils';
import {LOG_OUT} from '../../../../lib/graphql/mutations';
import {LogOut as LogOutData} from "../../../../lib/graphql/mutations/LogOut/__generated__/LogOut";
import { useMutation } from '@apollo/react-hooks';

interface Props {
    viewer: Viewer;
    setViewer: (Viewer: Viewer) => void;
}

const {Item, SubMenu} = Menu;

export const MenuItems = ({viewer, setViewer}: Props) => {
    const [logOut] = useMutation<LogOutData>(LOG_OUT, {
        onCompleted: (data) => {
            if (data && data.logOut) {
                setViewer(data.logOut);
                sessionStorage.removeItem("token");
                displaySuccessNotification("You've successfully logged out!");
            }
        },
        onError: data => {
            displayErrorMessage("Sorry! We weren't able to log you out. Please try again later!");
        }
    });

    const handleLogOut = () => {
        logOut();
    }

    const subMenuLogin = viewer.id && viewer.avatar ? (
        <SubMenu key="loggined" title={<Avatar src={viewer.avatar} />}>
            <Item key="user">
                <Link to={`/user/${viewer.id}`}>
                <Icon type="user" /> Profile
                </Link>
            </Item>
            <Item key="logout">
                <div onClick={handleLogOut}>
                <Icon type="logout" /> Log Out
                </div>
            </Item>
        </SubMenu>
    ) : (
        <Item key="login">
            <Link to="/login">
                <Button type="primary">Sign In</Button>
            </Link>
        </Item>
    );

    return (
        <Menu mode="horizontal" selectable={false} className="menu">
            <Item key="host">
                <Link to="/host"><Icon type="home" /> Host</Link>
            </Item>
            {subMenuLogin}
        </Menu>
    );
}