import React from 'react';

const Loader: React.FC = () => {
    return (
        <div className="flex items-center justify-center p-4">
            <img
                src="/loading.gif"
                alt="Loading..."
                className="w-16 h-16 object-contain"
            />
        </div>
    );
};

export default Loader;
