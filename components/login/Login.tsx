import React, {useState} from "react";
import {
    Button,
    TextField,
    Grid,
    Paper,
    AppBar,
    Typography,
    Toolbar,
    Link,
} from "@material-ui/core";
import {createTheme, ThemeProvider} from '@material-ui/core/styles';
import purple from '@material-ui/core/colors/purple';
import styles from './Login.module.css'

type Props = {
    title: string;
    onLogin: (username: string, password: string) => Promise<boolean>;
    onForgotPasswordClicked?: () => void;
    primaryColor?: string;
    errorColor?: string;
}

function Login(props: Props) {
    const {title, onLogin, onForgotPasswordClicked, primaryColor, errorColor} = props;
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    async function handleSubmit(event: React.SyntheticEvent) {
        event.preventDefault();
        if (username.length > 0 && password.length > 0) {
            setLoginError('');
            if (!(await onLogin(username, password))) {
                setLoginError('Login failed');
            }
            setPassword('');
        }
    }

    const theme = (primaryColor || errorColor) ? createTheme({
        palette: {
            ...(primaryColor && {
                primary: {
                    main: primaryColor,
                }
            }),
            ...(errorColor && {
                error: {
                    main: errorColor,
                }
            }),
        },
    }) : createTheme();

    return (
        <div>
            <ThemeProvider theme={theme}>
                <AppBar position="static" color="primary">
                    <Toolbar>
                        <Grid container justifyContent="center" wrap="wrap">
                            <Grid item>
                                <Typography variant="h6">{title}</Typography>
                            </Grid>
                        </Grid>
                    </Toolbar>
                </AppBar>
                <Grid container spacing={0} justifyContent="center" direction="row">
                    <Grid item>
                        <Grid
                            container
                            direction="column"
                            justifyContent="center"
                            spacing={2}
                            className={styles.loginForm}
                        >
                            <Paper
                                variant="elevation"
                                elevation={2}
                                className={styles.loginBackground}
                            >
                                <Grid item>
                                    <Typography component="h1" variant="h5">
                                        Sign in
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <form onSubmit={handleSubmit}>
                                        <Grid container direction="column" spacing={2}>
                                            <Grid item>
                                                <TextField
                                                    type="email"
                                                    placeholder="Email"
                                                    autoComplete="username"
                                                    fullWidth
                                                    name="username"
                                                    variant="outlined"
                                                    value={username}
                                                    onChange={(event) => setUsername(event.target.value)}
                                                    required
                                                    autoFocus
                                                />
                                            </Grid>
                                            <Grid item>
                                                <TextField
                                                    type="password"
                                                    placeholder="Password"
                                                    autoComplete="current-password"
                                                    fullWidth
                                                    name="password"
                                                    variant="outlined"
                                                    value={password}
                                                    onChange={(event) => setPassword(event.target.value)}
                                                    required
                                                />
                                            </Grid>
                                            <Grid item>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    type="submit"
                                                    className={styles.buttonBlock}
                                                >
                                                    Login
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </form>
                                </Grid>
                                {onForgotPasswordClicked && <Grid item>
                                    <Link href="#" variant="body2" onClick={onForgotPasswordClicked} >
                                        Forgot Password?
                                    </Link>
                                </Grid>}
                                {loginError && <Grid item>
                                    <Typography component="p" variant="body2" color="error" >
                                        {loginError}
                                    </Typography>
                                </Grid>}
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
            </ThemeProvider>
        </div>
    );
}
export default Login;