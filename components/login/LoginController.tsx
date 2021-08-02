import React, {useEffect} from 'react'
import config from '../../pages/api/config';
import Cookie from '../../pages/api/types/incoming/Cookie';
import postRequest from '../utils/postRequest';
import LoginView from './LoginView';

type Props = {
    onLogin: (authCookies: Cookie[]) => void;
    whileLoggingIn: (value: React.SetStateAction<boolean>) => void
}
export default function LoginController(props: Props) {
    const {onLogin, whileLoggingIn} = props;

    useEffect(() => {
        const fromLocalStorage = localStorage.getItem(config.AUTH_COOKIES_KEY);
        if (fromLocalStorage) {
            onLogin(JSON.parse(fromLocalStorage));
        }
    }, []);

    const handleLogin = async (username: string, password: string): Promise<boolean> => {
        try {
            whileLoggingIn(true);
            const response = await postRequest(config.loginApiUrl, {username, password});
            const newAuthCookies: Cookie[] = await response.json();
            localStorage.setItem(config.AUTH_COOKIES_KEY, JSON.stringify(newAuthCookies));
            onLogin(newAuthCookies);
            return true;
        } catch (error) {
            console.log(`Something went wrong: ${error.message}`);
            return false;
        } finally {
            whileLoggingIn(false);
        }
    }

    return (
        <LoginView title={'Cycling Activities'} onLogin={handleLogin} primaryColor={config.BG_COLOR} />
    )
}
