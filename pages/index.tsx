import React from 'react'
import Head from 'next/head'
import styles from '../styles/IndexPage.module.css'

import dynamic from 'next/dynamic'

const DynamicComponentWithNoSSR = dynamic(
    () => import('../components/Leaflet'),
    {ssr: false}
)

function IndexPage() {
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
            <h1>Cycling Activities</h1>
            <DynamicComponentWithNoSSR />
        </div>
    )
}

export default IndexPage