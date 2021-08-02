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
import styles from './LoginView.module.css'

type Props = {
    title: string;
    onLogin: (username: string, password: string) => Promise<boolean>;
    onForgotPasswordClicked?: () => void;
    primaryColor?: string;
    errorColor?: string;
}

export default function LoginView(props: Props) {
    const {title, onLogin, onForgotPasswordClicked, primaryColor, errorColor} = props;
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    async function handleSubmit(event: React.SyntheticEvent) {
        event.preventDefault();
        if (username.length > 0 && password.length > 0) {
            setIsLoggingIn(true);
            setLoginError('');
            if (!(await onLogin(username, password))) {
                setPassword('');
                setIsLoggingIn(false);
                setLoginError('Login failed');
            }
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
                                                    disabled={isLoggingIn}
                                                >
                                                    {isLoggingIn ? 'Logging in ...' : 'Login'}
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