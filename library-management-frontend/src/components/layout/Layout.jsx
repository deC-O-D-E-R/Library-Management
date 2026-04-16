import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = ({ children }) => {
    return (
        <div className="h-screen flex flex-col bg-primary overflow-hidden">
            <Navbar />

            {/* Below navbar: sidebar + right column */}
            <div className="flex flex-1 mt-16 overflow-hidden">

                <Sidebar />

                {/* Right column: scrollable content + sticky footer */}
                <div className="ml-56 flex flex-col flex-1 overflow-hidden">
                    <main
                        className="flex-1 overflow-y-auto p-6"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(30,61,32,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(30,61,32,.03) 1px, transparent 1px)',
                            backgroundSize: '32px 32px'
                        }}
                    >
                        {children}
                    </main>

                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default Layout;