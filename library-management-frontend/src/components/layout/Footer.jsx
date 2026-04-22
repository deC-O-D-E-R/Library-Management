const Footer = () => {
    return (
        <footer className="border-t border-border bg-sidebar py-3 px-6">
            <p className="text-text-secondary text-xs text-center">
                © {new Date().getFullYear()} CDOT Library Portal. All rights reserved.
            </p>
        </footer>
    );
};

export default Footer;