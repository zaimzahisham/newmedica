import React, { Suspense } from 'react';
import OrderSuccessPage from './OrderSuccess';

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OrderSuccessPage />
        </Suspense>
    )
}


