import React, {useContext, useState} from 'react'
import Head from 'next/head'
import styles from '../styles/IndexPage.module.css'
import dynamic from 'next/dynamic'
import {Grid} from '@material-ui/core'
import Cookie from './api/types/incoming/Cookie';
import config from './api/config'
import CustomBackdrop from '../components/backgrop/CustomBackdrop'
import SetVhResponsivelyWithoutSSR from '../components/utils/setVhResponsively/SetVhResponsivelyWithoutSSR'

const LoginWithoutSSR = dynamic(
    () => import('../components/login/LoginController'),
    {ssr: false}
)

const LeafletWithoutSSR = dynamic(
    () => import('../components/Leaflet'),
    {ssr: false}
)

function IndexPage() {
    const [authCookies, setAuthCookies] = useState<Cookie[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const isLoggedIn = (Array.isArray(authCookies) && authCookies.length > 0);

    const handleLogin = (authCookies: Cookie[]) => {
        setIsLoading(true);
        setAuthCookies(authCookies);
        setIsLoading(false);
    }
    const handleLogout = () => {
        setIsLoading(true);
        localStorage.removeItem(config.AUTH_COOKIES_KEY);
        setAuthCookies([]);
        setIsLoading(false);
    }

    return (
        <div>
            <Head>
                <title>Cycling Activities</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                {/* leaflet stylesheet */}
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
                    integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
                    crossOrigin="" />
                {/* leaflet.js */}
                <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"
                    integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA=="
                    crossOrigin=""></script>
                {/* material-ui Roboto-Font */}
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
            </Head>
            <SetVhResponsivelyWithoutSSR />
            <CustomBackdrop isLoading={isLoading} />
            {!isLoggedIn &&
                <LoginWithoutSSR
                    onLogin={handleLogin}
                    whileLoggingIn={setIsLoading}
                />}
            {isLoggedIn && <Grid
                container
                direction="column"
                className={styles.mainGrid}
            >
                <Grid container>
                    <Grid item xs={9}>
                        <h1>Cycling Activities</h1>
                    </Grid>
                    <Grid item xs={3} className={styles.logoutBtn}>
                        <button
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </Grid>
                </Grid>
                <LeafletWithoutSSR
                    authCookies={authCookies}
                    onLogout={handleLogout}
                    whileLoggingIn={setIsLoading}
                />
            </Grid>}
        </div>
    )
}

export default IndexPage