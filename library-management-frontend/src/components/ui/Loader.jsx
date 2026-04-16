const Loader = () => {
    return (
        <div className="flex items-center justify-center h-full w-full py-20">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-surface border-t-accent rounded-full animate-spin"></div>
                <p className="text-text-secondary text-sm">Loading...</p>
            </div>
        </div>
    );
};

export default Loader;