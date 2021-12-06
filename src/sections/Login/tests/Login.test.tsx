import React from 'react';
import { Router, Route } from 'react-router-dom';
import {createMemoryHistory} from 'history';
import {render, fireEvent, waitFor} from '@testing-library/react';
import {GraphQLError} from 'graphql';
import {MockedProvider} from '@apollo/react-testing';
import {AUTH_URL} from '../../../lib/graphql/queries';
import {LOG_IN} from '../../../lib/graphql/mutations';
import {Login} from '../';

const defaultProps = {
    setViewer: () => {}
};

describe('Login', () => {
    // avoid console warings around scrollTo
    window.scrollTo = () => {};

    describe('AUTH_URL Query', () => {
        it('redirects the user when query is successfull', async () => {

            window.location.assign = jest.fn();

            const authUrlMock = {
                request: {
                    query: AUTH_URL,
                },
                result: {
                    data: {
                        authUrl: 'https://google.com/signin'
                    }
                }
            };

            const history = createMemoryHistory({
                initialEntries: ['/login']
            });

            const {queryByText, getByRole} = render(
                <MockedProvider mocks={[authUrlMock]} addTypename={false}>
                    <Router history={history}>
                        <Route path="/login">
                            <Login {...defaultProps} />
                        </Route>
                    </Router>
                </MockedProvider>
            );
            
            const authUrlButton = getByRole("button");;
            fireEvent.click(authUrlButton);

            await waitFor(() => {
                expect(window.location.assign).toHaveBeenLastCalledWith('https://google.com/signin');
                expect(queryByText("Sorry! We weren't able to log you in. Please try again later!")).toBeNull(); 
            });
        });    

        it('does not redirect the user when query is unsuccessfull', async () => {
            window.location.assign = jest.fn();

            const authUrlMock = {
                request: {
                    query: AUTH_URL,
                },
                errors: [new GraphQLError("Something wen't wrong")],
            };

            const history = createMemoryHistory({
                initialEntries: ['/login']
            });

            const {queryByText, getByRole} = render(
                <MockedProvider mocks={[authUrlMock]} addTypename={false}>
                    <Router history={history}>
                        <Route path="/login">
                            <Login {...defaultProps} />
                        </Route>
                    </Router>
                </MockedProvider>
            );
            
            const authUrlButton = getByRole("button");;
            fireEvent.click(authUrlButton);

            await waitFor(() => {
                expect(window.location.assign).not.toHaveBeenLastCalledWith('https://google.com/signin');
                expect(
                    queryByText("Sorry! We weren't able to log you in. Please try again later!")
                ).not.toBeNull(); 
            });
        });    
    });

    describe('LOGIN Mutation', () => {
        it("when no code exist in the /login route, the mutation is not fired", async () => {

            const loginMock = {
                request: {
                    query: LOG_IN,
                    variables: {
                        input: {
                            code: '1234',
                        }
                    }
                },
                result: {
                    data: {
                        logIn: {
                            id: '111',
                            token: '4321',
                            avatar: 'image.png',
                            hasWallet: false,
                            didRequest: true
                        }
                    }
                }
            };

            const history = createMemoryHistory({
                initialEntries: ['/login']
            });

            render(
                <MockedProvider mocks={[loginMock]} addTypename={false}>
                    <Router history={history}>
                        <Route path="/login">
                            <Login {...defaultProps} />
                        </Route>
                    </Router>
                </MockedProvider>
            );

            await waitFor(() => {
               expect(history.location.pathname).not.toBe('/user/111');
            });
        });

        describe('when code exists in the /login route as a query parameter', () => {
            it("redirects the user to their user page when the mutation is successful", async () => {
                const loginMock = {
                    request: {
                        query: LOG_IN,
                        variables: {
                            input: {
                                code: '1234',
                            }
                        }
                    },
                    result: {
                        data: {
                            logIn: {
                                id: '111',
                                token: '4321',
                                avatar: 'image.png',
                                hasWallet: false,
                                didRequest: true
                            }
                        }
                    }
                };
    
                const history = createMemoryHistory({
                    initialEntries: ['/login?code=1234']
                });
    
                render(
                    <MockedProvider mocks={[loginMock]} addTypename={false}>
                        <Router history={history}>
                            <Route path="/login">
                                <Login {...defaultProps} />
                            </Route>
                        </Router>
                    </MockedProvider>
                );
    
                await waitFor(() => {
                   expect(history.location.pathname).toBe('/user/111');
                });
            });                 

            it("does not redirect the user to their user page and display an error message when the mutation is unsuccessful", async () => {
                const loginMock = {
                    request: {
                        query: LOG_IN,
                        variables: {
                            input: {
                                code: '1234',
                            }
                        }
                    },
                    errors: [new GraphQLError("Something wen't wrong")],
                };
    
                const history = createMemoryHistory({
                    initialEntries: ['/login?code=1234']
                });
    
                const {queryByText} = render(
                    <MockedProvider mocks={[loginMock]} addTypename={false}>
                        <Router history={history}>
                            <Route path="/login">
                                <Login {...defaultProps} />
                            </Route>
                        </Router>
                    </MockedProvider>
                );
    
                await waitFor(() => {
                   expect(history.location.pathname).not.toBe('/user/111');
                   expect(
                       queryByText("Sorry! We weren't able to log you in. Please try again later!")
                   ).not.toBeNull();
                });
            });                 
        });
    }); 
});