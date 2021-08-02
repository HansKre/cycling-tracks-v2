import {Backdrop, CircularProgress, makeStyles} from '@material-ui/core'
import React from 'react'

const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
}));

type Props = {
    isLoading: boolean;
}

export default function CustomBackdrop(props: Props) {
    const {isLoading} = props;
    const classes = useStyles();
    return (
        <Backdrop className={classes.backdrop} open={isLoading}>
            <CircularProgress color="inherit" />
        </Backdrop>
    )
}
