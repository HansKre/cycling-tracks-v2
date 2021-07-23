interface Cookie {
    domain: string;
    expiry: string;
    name: string;
    path: string;
    secure: boolean;
    subdomains: boolean;
    value: string;
}

export default Cookie;